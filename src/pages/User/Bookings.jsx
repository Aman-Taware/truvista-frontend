import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import Modal from '../../components/ui/Modal';
import bookingApi from '../../api/bookingApi';
import { formatDate } from '../../utils/format';

/**
 * User Bookings Page - Modern & Compact Design
 * Displays all property bookings made by the user in a compact, streamlined layout
 */
const BookingsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshToken } = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rescheduleModal, setRescheduleModal] = useState({
    isOpen: false,
    bookingId: null,
    currentDate: null,
    newDate: null,
    processing: false
  });
  
  // Refs to prevent concurrent API calls
  const bookingsFetchingRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  
  // Fetch bookings with retry mechanism for network issues
  const fetchBookings = useCallback(async () => {
    // Skip if we're already fetching
    if (bookingsFetchingRef.current) {
      console.log('Bookings fetch already in progress, skipping duplicate request');
      return;
    }
    
    // Skip if not authenticated
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping bookings fetch');
      setLoading(false);
      return;
    }
    
    try {
      bookingsFetchingRef.current = true;
        setLoading(true);
        
      // Add a timestamp to prevent cache issues and avoid duplicate request cancellation
      const timestamp = Date.now();
      const response = await bookingApi.getUserBookings({ _t: timestamp });
      
      // Check if we have actual data - API structure may vary
      if (Array.isArray(response)) {
        // Data already processed
        setBookings(response.map(booking => ({ ...booking, id: booking.id || Math.random().toString() })));
      } else if (response && response.data && Array.isArray(response.data)) {
        // Standard API response
        setBookings(response.data.map(booking => ({ ...booking, id: booking.id || Math.random().toString() })));
      } else if (response && response.content && Array.isArray(response.content)) {
        // Paginated response
        setBookings(response.content.map(booking => ({ ...booking, id: booking.id || Math.random().toString() })));
      } else if (response && Array.isArray(response.bookings)) {
        // Custom booking wrapper
        setBookings(response.bookings.map(booking => ({ ...booking, id: booking.id || Math.random().toString() })));
      } else {
        // Fallback
        console.warn('Unexpected response format from booking API:', response);
        setBookings([]);
      }
      
      // Reset retry counter on success
      retryCountRef.current = 0;
      setError(null);
    } catch (err) {
      // Handle "user logged out" specific error
      if (err.message === 'User is logged out. Please login again.') {
        console.log('Not fetching bookings - user is logged out');
        setError('Please login to view your bookings');
        setBookings([]);
        return;
      }
      
      // Handle duplicate request cancellation
      if (err.message === 'Duplicate request cancelled') {
        console.log('Duplicate bookings request cancelled');
        return;
      }
      
      console.error('Error fetching bookings:', err);
      
      // Check if this is a network error (not an auth error)
      const isNetworkError = !err.response && err.message !== 'User is logged out. Please login again.';
      
      if (isNetworkError && retryCountRef.current < maxRetries) {
        // Exponential backoff for retries: 1s, 2s, 4s
        const retryDelay = Math.pow(2, retryCountRef.current) * 1000;
        retryCountRef.current++;
        
        console.log(`Network error fetching bookings. Retrying in ${retryDelay}ms (${retryCountRef.current}/${maxRetries})`);
        setTimeout(fetchBookings, retryDelay);
        return;
      }
      
      // Set error state for UI feedback
      setError(err.message || 'Failed to load bookings');
      
      // Show a notification for better UX
      showNotification({
        type: 'error',
        message: 'Failed to load bookings. Please try again later.'
      });
      
      setBookings([]);
    } finally {
          setLoading(false);
      bookingsFetchingRef.current = false;
    }
  }, [isAuthenticated, showNotification]);
  
  // Initial data fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
        setLoading(false);
      }
  }, [isAuthenticated, fetchBookings]);
  
  // Handle viewing a property
  const handleViewProperty = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  // Handle opening the reschedule modal
  const handleReschedule = (bookingId, currentDate) => {
    setRescheduleModal({
      isOpen: true,
      bookingId,
      currentDate,
      newDate: currentDate || new Date().toISOString().split('T')[0],
      processing: false
    });
  };
  
  // Close the reschedule modal
  const closeRescheduleModal = () => {
    setRescheduleModal({
      isOpen: false,
      bookingId: null,
      currentDate: null,
      newDate: null,
      processing: false
    });
  };
  
  // Handle date change in the reschedule modal
  const handleDateChange = (e) => {
    setRescheduleModal({
      ...rescheduleModal,
      newDate: e.target.value
    });
  };
  
  // Submit the reschedule request
  const submitReschedule = async () => {
    // Validate the selected date
    const today = new Date();
    const selectedDate = new Date(rescheduleModal.newDate);
    
    // Check if date is in the past
    if (selectedDate < today) {
      showNotification({
        type: 'error',
        message: 'Please select a future date.'
      });
      return;
    }
    
    // Check if date is within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    if (selectedDate > thirtyDaysFromNow) {
      showNotification({
        type: 'error',
        message: 'Please select a date within the next 30 days.'
      });
      return;
    }
    
    try {
      setRescheduleModal({
        ...rescheduleModal,
        processing: true
      });
      
      // Prepare update data
      const updateData = {
        visitDate: rescheduleModal.newDate,
        status: 'PENDING' // Change status to PENDING
      };
      
      // Call the API to update the booking
      await bookingApi.updateBooking(rescheduleModal.bookingId, updateData);
      
      // Refresh the bookings list
      // Reset the fetching ref to force a new fetch
      bookingsFetchingRef.current = false;
      const response = await bookingApi.getUserBookings({
        _t: Date.now() // Add timestamp to prevent duplicate request cancellation
      });
      
      if (response) {
        let bookingsData = [];
        
        if (response.data && Array.isArray(response.data)) {
          bookingsData = response.data;
        } else if (Array.isArray(response)) {
          bookingsData = response;
        } else if (response.bookings) {
          bookingsData = response.bookings;
        } else if (response.items) {
          bookingsData = response.items;
        } else {
          bookingsData = [response];
        }
        
        const processedData = bookingsData.map((booking, index) => {
          if (!booking.id && !booking.bookingId) {
            return { ...booking, id: `booking-${index}` };
          }
          return booking;
        });
        
        setBookings(processedData);
      }
      
      closeRescheduleModal();
      
        showNotification({
          type: 'success',
        message: 'Your booking has been rescheduled and is pending confirmation.'
        });
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      setRescheduleModal({
        ...rescheduleModal,
        processing: false
      });
      showNotification({
        type: 'error',
        message: 'Failed to reschedule booking. Please try again.'
      });
    }
  };
  
  // Loading state with elegant spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4 shadow-md"></div>
          <p className="text-neutral-800 font-medium text-sm">Loading your bookings...</p>
        </div>
      </div>
    );
  }
  
  // Make sure bookings is always an array
  const actualBookings = bookings || [];
  console.log("Bookings to render:", actualBookings);
  
  // Group bookings by status
  const groupedBookings = actualBookings.reduce((acc, booking) => {
    const status = booking.status || 'OTHER';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(booking);
    return acc;
  }, {});
  
  // Order of statuses to display
  const statusOrder = ['CONFIRMED', 'PENDING', 'COMPLETED'];

  // Get status color for section header
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500';
      case 'PENDING': return 'bg-amber-500';
      case 'SCHEDULED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-primary-500';

      default: return 'bg-neutral-500';
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <Container>
        {/* Page Header - Compact Design */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Your Bookings</h1>
              <p className="text-neutral-700 text-sm mt-1">Manage your property visit appointments</p>
            </div>
            <span className="mt-2 md:mt-0 bg-neutral-100 text-neutral-800 px-3 py-0.5 rounded-full text-xs font-medium">
              {actualBookings.length} {actualBookings.length === 1 ? 'booking' : 'bookings'}
            </span>
          </div>
        </div>
        
        {actualBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mb-2">No Bookings Found</h2>
              <p className="text-neutral-700 text-sm mb-4">
                You haven't made any property visit bookings yet. Browse our properties and schedule a visit.
              </p>
              <Button
                as={Link}
                to="/properties"
                variant="primary"
                size="sm"
              >
                Browse Properties
              </Button>
            </div>
            </div>
          ) : (
          <div className="space-y-6">
            {statusOrder.map(status => {
              const statusBookings = groupedBookings[status] || [];
              if (statusBookings.length === 0) return null;
              
              return (
                <div key={status} className="space-y-3">
                  <h2 className="text-base font-bold text-neutral-900 flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full mr-2 ${getStatusColor(status)}`}></span>
                    {status.charAt(0) + status.slice(1).toLowerCase()} ({statusBookings.length})
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {statusBookings.map(booking => {
                      // Debug this booking
                      console.log("Rendering booking:", booking);
                      
                      // Get property ID safely - try multiple paths based on API response structure
                      const propertyId = 
                        (booking.property && booking.property.id) ? booking.property.id : 
                        (booking.property && booking.property.propertyId) ? booking.property.propertyId :
                        booking.propertyId || null;
                      
                      // Get booking ID safely
                      const bookingId = booking.id || booking.bookingId || null;
                      
                      // Get property name
                      const propertyName = booking.property?.name || 
                                          booking.property?.propertyName || 
                                          booking.propertyName || 
                                          "Property Visit";
                      

                      
                      // Get visit date in readable format
                      const visitDate = booking.date || booking.visitDate || booking.bookingDate;
                      const visitTime = booking.time || booking.visitTime || booking.bookingTime;
                      
                      // Can change date if booking is pending or confirmed
                      const canChangeDate = booking.status === 'CONFIRMED' || 
                                           booking.status === 'PENDING' || 
                                           booking.status === 'SCHEDULED';
                      
                      return (
                        <div key={bookingId || `booking-${Math.random()}`} 
                             className="bg-white rounded-md shadow-sm overflow-hidden">
                          {/* Booking Card Header - Compact Version */}
                          <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100 flex justify-between items-center">
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="font-medium text-neutral-800 text-xs">
                                {visitDate ? formatDate(visitDate) : 'Date pending'}
                                {visitTime ? `, ${visitTime}` : ''}
                          </span>
                        </div>
                            <BookingStatusBadge status={booking.status} className="ml-1 text-[10px] px-1.5 py-0.5" />
                          </div>
                          
                          {/* Booking Card Body - Compact Version */}
                          <div className="p-3">
                            {/* Property Name with Link */}
                            <div className="flex items-center justify-between">
                              <h3 
                                className="font-semibold text-sm text-neutral-900 hover:text-primary-600 transition-colors truncate cursor-pointer"
                                onClick={() => propertyId && handleViewProperty(propertyId)}
                              >
                                {propertyName}
                              </h3>
                      </div>
                      
                            
                            {/* Compact Action Buttons */}
                            <div className="flex justify-between border-t border-neutral-100 pt-2 mt-1">
                              <Button 
                                onClick={() => propertyId && handleViewProperty(propertyId)}
                                variant="outline"
                                size="xs"
                                className="text-xs flex-1 mr-2"
                              >
                            View Property
                          </Button>
                        
                              {canChangeDate && bookingId && (
                          <Button
                                  onClick={() => handleReschedule(bookingId, visitDate)}
                                  variant="outline"
                                  size="xs"
                                  className="text-xs flex-1"
                                >
                                  Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        
        {/* Navigation Links */}
        <div className="mt-8 pt-4 border-t border-neutral-200 text-center">
          <Button 
            as={Link}
            to="/properties" 
            variant="outline"
            size="sm"
            className="mr-3"
          >
            Browse Properties
          </Button>
          <Button 
            as={Link}
            to="/user/shortlist" 
            variant="primary"
            size="sm"
          >
            View Your Shortlist
          </Button>
        </div>
      </Container>
      
      {/* Reschedule Modal */}
      {rescheduleModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-5 border-b border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900">Reschedule Booking</h3>
              <p className="text-neutral-700 text-sm mt-1">
                Select a new date for your property visit. New date must be within 30 days.
              </p>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <label htmlFor="visitDate" className="block text-sm font-medium text-neutral-700 mb-1">
                  Select New Visit Date
                </label>
                <input
                  type="date"
                  id="visitDate"
                  name="visitDate"
                  value={rescheduleModal.newDate}
                  onChange={handleDateChange}
                  min={new Date().toISOString().split('T')[0]}
                  max={(() => {
                    const maxDate = new Date();
                    maxDate.setDate(maxDate.getDate() + 30);
                    return maxDate.toISOString().split('T')[0];
                  })()}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Note: Rescheduling will change the booking status to "Pending" for reconfirmation.
                </p>
              </div>
            </div>
            
            <div className="p-5 border-t border-neutral-200 flex justify-end space-x-3">
              <Button
                onClick={closeRescheduleModal}
                variant="ghost"
                size="sm"
                disabled={rescheduleModal.processing}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReschedule}
                variant="primary"
                size="sm"
                disabled={rescheduleModal.processing}
                isLoading={rescheduleModal.processing}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage; 