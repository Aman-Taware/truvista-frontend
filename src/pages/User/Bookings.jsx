import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationContext } from '../../contexts/NotificationContext';
import Container from '../../components/ui/Container';
import Button from '../../components/ui/Button';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import bookingApi from '../../api/bookingApi';
import { formatDate } from '../../utils/format';

/**
 * User Bookings Page - Modern & Compact Design
 * Displays all property bookings made by the user in a compact, streamlined layout
 */
const BookingsPage = () => {
  const navigate = useNavigate();
  const { showNotification } = useContext(NotificationContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Fetch user's bookings
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Direct API call
        const response = await bookingApi.getUserBookings();
        console.log("Bookings API Response:", response);
        
        // Process response - already handled by interceptor
        if (response) {
          let bookingsData = [];
          
          // Check for API response wrapped in data property
          if (response.data && Array.isArray(response.data)) {
            bookingsData = response.data;
          } else if (Array.isArray(response)) {
            bookingsData = response;
          } else if (response.bookings) {
            bookingsData = response.bookings;
          } else if (response.items) {
            bookingsData = response.items;
          } else {
            // If it's a single object
            bookingsData = [response];
          }
          
          console.log("Processed bookings data:", bookingsData);
          
          // Ensure each booking has an ID
          const processedData = bookingsData.map((booking, index) => {
            // Debug each booking object
            console.log(`Booking ${index}:`, booking);
            
            if (!booking.id && !booking.bookingId) {
              return { ...booking, id: `booking-${index}` };
            }
            return booking;
          });
          
          setBookings(processedData);
        } else {
          setBookings([]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setLoading(false);
        showNotification({
          type: 'error',
          message: 'Failed to load bookings. Please try again.'
        });
      }
    };
    
    fetchBookings();
  }, [showNotification]);
  
  // Handle viewing a property
  const handleViewProperty = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  // Handle booking reschedule
  const handleReschedule = (bookingId) => {
    // In a real implementation, this would open a modal or navigate to a reschedule page
    showNotification({
      type: 'info',
      message: 'Reschedule functionality will be available soon'
    });
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
  const statusOrder = ['CONFIRMED', 'PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'OTHER'];

  // Get status color for section header
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-emerald-500';
      case 'PENDING': return 'bg-amber-500';
      case 'SCHEDULED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-primary-500';
      case 'CANCELLED': return 'bg-neutral-400';
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
                                  onClick={() => handleReschedule(bookingId)}
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
    </div>
  );
};

export default BookingsPage; 