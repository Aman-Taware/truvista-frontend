import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../api/adminApi';
import { NotificationContext } from '../../contexts/NotificationContext';
import { BOOKING_STATUS, BOOKING_STATUS_COLORS } from '../../constants/constants';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingsPage = () => {
  // CSS for loader
  const loaderStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .loader {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
    }
  `;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useContext(NotificationContext);
  
  // State for detailed statistics
  const [detailedStats, setDetailedStats] = useState(null);
  const [loadingDetailedStats, setLoadingDetailedStats] = useState(true);
  
  // State for upcoming bookings
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  
  // Add state for statistics
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    recentBookingsCount: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Add state to track which dropdown is open
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  // Enhanced states for pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedDates, setSelectedDates] = useState([null, null]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const itemsPerPage = 10;

  // Add state for the modal/popup and selected booking
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatedVisitDate, setUpdatedVisitDate] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState(null);


  // Fetch data when component mounts or when filters change
  useEffect(() => {
    // Only fetch when the page loads initially
    fetchBookings();
    fetchBookingStats();
    fetchDetailedStats();
    fetchUpcomingBookings();
    
    // Add event listener for closing dropdown
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Re-fetch when page changes
  useEffect(() => {
    if (!loading) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);
  
  // Cleanup function to handle clicks outside dropdown
  const handleClickOutside = (event) => {
    if (openDropdownId && !event.target.closest('.dropdown-container')) {
      setOpenDropdownId(null);
    }
  };

  const fetchDetailedStats = async (startDate = null, endDate = null) => {
    setLoadingDetailedStats(true);
    try {
      const stats = await adminApi.getDetailedBookingStats(startDate, endDate);
      setDetailedStats(stats);
    } catch (err) {
      console.error('Error fetching detailed booking stats:', err);
      // Don't show error notification for stats, just log it
    } finally {
      setLoadingDetailedStats(false);
    }
  };

  const fetchUpcomingBookings = async (days = 7) => {
    setLoadingUpcoming(true);
    try {
      console.log('Fetching upcoming bookings with days parameter:', days);
      const response = await adminApi.getUpcomingBookings(days);
      console.log('Upcoming bookings response:', response);
      
      // Handle the response properly based on its structure
      if (response) {
        const bookingsData = Array.isArray(response) ? response : 
                            response.content ? response.content : [];
        
        // Log first booking for debugging contact info
        if (bookingsData.length > 0) {
          const firstBooking = bookingsData[0];
          console.log('First upcoming booking:', firstBooking);
          console.log('First upcoming booking contact field check:', {
            'userContactNo': firstBooking.userContactNo,
            'Contact info extracted': extractContactInfo(firstBooking)
          });
        }
        
        console.log('Processed upcoming bookings data:', bookingsData);
        setUpcomingBookings(bookingsData);
      } else {
        console.warn('No upcoming bookings data returned');
        setUpcomingBookings([]);
      }
    } catch (err) {
      console.error('Error fetching upcoming bookings:', err);
      setUpcomingBookings([]);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const fetchBookingStats = async () => {
    setLoadingStats(true);
    try {
      const response = await adminApi.getBookingStats();
      console.log('Booking stats response:', response);
      setStats(response || {
        totalBookings: 0,
        pendingCount: 0,
        confirmedCount: 0,
        completedCount: 0,
        recentBookingsCount: 0
      });
    } catch (err) {
      console.error('Error fetching booking stats:', err);
      // Don't show error notification for stats, just log it
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Prepare parameters based on the actual state variables in the component
      const params = {
        page: currentPage - 1, // API is 0-indexed
        size: itemsPerPage,
        status: selectedStatuses.length > 0 ? selectedStatuses : null,
        startDate: selectedDates[0] ? selectedDates[0].toISOString().split('T')[0] : null,
        endDate: selectedDates[1] ? selectedDates[1].toISOString().split('T')[0] : null,
        searchTerm: searchTerm || null,
        propertyId: selectedPropertyId
      };
      
      console.log('Calling getFilteredBookings with params:', params);
      
      const response = await adminApi.getFilteredBookings(params);
      
      console.log('DEBUG - Raw API response type:', typeof response);
      console.log('DEBUG - Raw API response:', response);
      
      // Log the structure of the response for debugging
      if (response) {
        console.log('DEBUG - Response keys:', Object.keys(response));
        
        if (response.content) {
          console.log('DEBUG - Content is array:', Array.isArray(response.content));
          console.log('DEBUG - Content length:', response.content.length);
          
          if (response.content.length > 0) {
            console.log('DEBUG - First booking keys:', Object.keys(response.content[0]));
            console.log('DEBUG - First booking sample:', JSON.stringify(response.content[0], null, 2));
            
            // Log user object structure and contact information if available
            const firstBooking = response.content[0];
            console.log('DEBUG - User object in first booking:', firstBooking.user);
            if (firstBooking.user) {
              console.log('DEBUG - User fields:', Object.keys(firstBooking.user));
              console.log('DEBUG - Contact fields detected:', {
                'user.phone': firstBooking.user.phone,
                'user.phoneNumber': firstBooking.user.phoneNumber,
                'user.contactNo': firstBooking.user.contactNo,
                'user.contactNumber': firstBooking.user.contactNumber
              });
            }
            
            // Check for direct contact fields on booking object
            console.log('DEBUG - Direct contact fields on booking:', {
              'userContactNo': firstBooking.userContactNo,
              'userPhone': firstBooking.userPhone,
              'userPhoneNumber': firstBooking.userPhoneNumber,
              'phoneNumber': firstBooking.phoneNumber,
              'phone': firstBooking.phone,
              'contactNo': firstBooking.contactNo,
              'contactNumber': firstBooking.contactNumber,
              'contact': firstBooking.contact
            });
            
            // Test our extraction function
            console.log('DEBUG - Contact extraction result:', extractContactInfo(firstBooking));
          }
        } else if (Array.isArray(response)) {
          console.log('DEBUG - Response is array of length:', response.length);
          
          if (response.length > 0) {
            console.log('DEBUG - First booking keys:', Object.keys(response[0]));
            console.log('DEBUG - First booking sample:', JSON.stringify(response[0], null, 2));
          }
        }
      }
      
      // Handle the paginated response
      if (response && response.content) {
        setBookings(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        console.log('Bookings loaded:', response.content.length, 'Total pages:', response.totalPages);
      } else if (response && Array.isArray(response)) {
        // Handle case where API returns an array instead of paginated response
        setBookings(response);
        setTotalPages(Math.ceil(response.length / itemsPerPage));
        setTotalElements(response.length);
        console.log('Bookings loaded (array):', response.length);
      } else {
        // If no valid data is returned
        console.warn('No valid bookings data returned:', response);
        setBookings([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      setBookings([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      await adminApi.updateBooking(bookingId, { status: newStatus });
      
      // Refresh the bookings list
      await fetchBookings();
      
      // Also refresh stats after status update
      await fetchBookingStats();
      await fetchDetailedStats();
      
      showNotification({
        type: 'success',
        message: `Booking status updated to ${newStatus.toLowerCase()}`
      });
      
      // Close dropdown
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Error updating booking status:', err);
      showNotification({
        type: 'error',
        message: 'Failed to update booking status. Please try again.'
      });
    }
  };

  const deleteBooking = async (bookingId) => {
    try {
      await adminApi.deleteBooking(bookingId);
      
      // Refresh the bookings list
      await fetchBookings();
      
      // Also refresh stats after deletion
      await fetchBookingStats();
      await fetchDetailedStats();
      
      showNotification({
        type: 'success',
        message: 'Booking deleted successfully'
      });
    } catch (err) {
      console.error('Error deleting booking:', err);
      showNotification({
        type: 'error',
        message: 'Failed to delete booking. Please try again.'
      });
    }
  };

  // Handlers for pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Toggle status selection in filter
  const toggleStatusFilter = (status) => {
    setSelectedStatuses(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  // Handle date range selection
  const handleDateRangeChange = (dates) => {
    setSelectedDates(dates);
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchBookings();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatuses([]);
    setSelectedDates([null, null]);
    setSelectedPropertyId(null);
    setCurrentPage(1);
  };

  // Get status color based on booking status
  const getStatusColor = (status) => {
    return BOOKING_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status actions based on current status
  const getStatusActions = (currentStatus) => {
    const allStatuses = Object.values(BOOKING_STATUS);
    
    // Remove the current status from the list of available actions
    return allStatuses.filter(status => status !== currentStatus);
  };

  // Extract contact information from a booking object
  const extractContactInfo = (booking) => {
    if (booking.user && booking.user.contactNo) {
      return booking.user.contactNo;
    }
    if (booking.userContactNo) {
      return booking.userContactNo;
    }
    if (booking.userEmail) {
      return booking.userEmail;
    }
    return '';
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Pagination display
  const paginationDisplay = () => {
    if (totalPages <= 0) return null;
    
    return (
      <nav className="mt-4 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="hidden sm:block">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{bookings.length ? ((currentPage - 1) * itemsPerPage) + 1 : 0}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalElements)}</span> of{' '}
            <span className="font-medium">{totalElements}</span> results
          </p>
        </div>
        <div className="flex-1 flex justify-between sm:justify-end">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </nav>
    );
  };

  // Function to open the modal with a booking
  const openBookingModal = (booking) => {
    console.log('Opening modal with booking:', booking);
    console.log('Available booking fields:', Object.keys(booking));
    
    // Log user object structure if it exists
    if (booking.user) {
      console.log('User object fields:', Object.keys(booking.user));
    }
    
    setSelectedBooking(booking);
    setUpdatedVisitDate(booking.visitDate ? new Date(booking.visitDate) : null);
    setUpdatedStatus(booking.status);
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeBookingModal = () => {
    setSelectedBooking(null);
    setIsModalOpen(false);
    setUpdatedVisitDate(null);
    setUpdatedStatus(null);
  };

  // Function to update the booking
  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      // Prepare update data
      const updateData = {
        id: selectedBooking.id,
        visitDate: updatedVisitDate ? updatedVisitDate.toISOString().split('T')[0] : null,
        status: updatedStatus
      };
      
      // Update booking
      await updateBookingStatus(selectedBooking.id, updatedStatus);
      
      // Close modal and refresh bookings
      closeBookingModal();
      fetchBookings();
      showNotification({
        type: 'success',
        message: 'Booking updated successfully'
      });
    } catch (error) {
      console.error('Error updating booking:', error);
      showNotification({
        type: 'error',
        message: 'Failed to update booking'
      });
    }
  };

  return (
    <AdminLayout>
      {/* Add a style tag for the loader */}
      <style>{loaderStyle}</style>
      
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Bookings Management</h1>
            <p className="mt-1 text-sm text-gray-700">
              Manage property visit bookings, view statistics, and track upcoming appointments.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => fetchBookings()}
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Bookings
            </button>
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
          
          {/* Statistics Cards */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-indigo-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-xl font-bold text-gray-900">
                    {loadingStats ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      stats.totalBookings || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Pending Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-amber-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-xl font-bold text-gray-900">
                    {loadingStats ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      stats.pendingCount || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Confirmed Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Confirmed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {loadingStats ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      stats.confirmedCount || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Completed Bookings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {loadingStats ? (
                      <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                    ) : (
                      stats.completedCount || 0
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings Section */}
        <div className="mb-6 bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700">
              Upcoming Bookings
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Site visits scheduled in the next 7 days
            </p>
          </div>
          
          {loadingUpcoming ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium">No upcoming bookings</p>
              <p className="mt-1 text-xs">No site visits scheduled in the next 7 days</p>
            </div>
          ) : (
            <div className="p-3">
              <div className="divide-y divide-gray-100">
                {(() => {
                  // Group bookings by date
                  const dateGroups = {};
                  
                  upcomingBookings.forEach(booking => {
                    const visitDate = booking.visitDate || booking.date;
                    const dateKey = new Date(visitDate).toDateString();
                    
                    if (!dateGroups[dateKey]) {
                      dateGroups[dateKey] = [];
                    }
                    dateGroups[dateKey].push(booking);
                  });
                  
                  // Sort dates
                  const sortedDates = Object.keys(dateGroups).sort((a, b) => 
                    new Date(a) - new Date(b)
                  );
                  
                  // Render each date group
                  return sortedDates.map(dateKey => (
                    <div key={dateKey} className="pt-2 pb-1 first:pt-0">
                      <h4 className="text-xs font-medium text-gray-500 mb-2 px-1">
                        {new Date(dateKey).toLocaleDateString(undefined, {
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric'
                        })}
                      </h4>
                      <div className="space-y-2">
                        {dateGroups[dateKey].map(booking => {
                          const bookingId = booking.id || booking.bookingId;
                          const propertyName = booking.property?.name || booking.propertyName || 'Unknown Property';
                          const userName = booking.user?.name || booking.userName || 'Unknown User';
                          const userContact = extractContactInfo(booking);
                          const bookingStatus = booking.status || booking.bookingStatus || 'PENDING';
                          
                          return (
                            <div 
                              key={bookingId}
                              className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => openBookingModal(booking)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <p className="font-medium text-gray-900 text-sm leading-tight">{propertyName}</p>
                                  <div className="text-xs text-gray-500 space-y-1">
                                    <p className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                      {userName}
                                    </p>
                                    <p className="flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                      </svg>
                                      {userContact}
                                    </p>
                                  </div>
                                </div>
                                <BookingStatusBadge status={bookingStatus} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>

        {/* Filter Section */}
        <div className="mt-6 bg-white shadow rounded-lg p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h3 className="text-base font-medium text-gray-900">Filters</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={applyFilters}
                className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Property/User
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter property name or user"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            
            {/* Date Range Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Visit Date Range
              </label>
              <DatePicker
                selectsRange={true}
                startDate={selectedDates[0]}
                endDate={selectedDates[1]}
                onChange={handleDateRangeChange}
                isClearable={true}
                placeholderText="Select date range"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                dateFormat="yyyy-MM-dd"
              />
            </div>

          </div>
        </div>

        {/* Bookings Table */}
        <div className="mt-4 mb-8 overflow-auto rounded-lg shadow">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="text-center p-4 text-gray-500">No bookings found. Try adjusting your filters.</div>
          ) : (
            <>
              {/* Group bookings by property */}
              {(() => {
                // Group bookings by property
                const propertyGroups = {};
                bookings.forEach(booking => {
                  const propertyName = booking.property?.name || booking.propertyName || 'Unknown Property';
                  const propertyId = booking.property?.id || booking.propertyId || 'unknown';
                  const key = `${propertyId}-${propertyName}`;
                  
                  if (!propertyGroups[key]) {
                    propertyGroups[key] = [];
                  }
                  propertyGroups[key].push(booking);
                });
                
                // Render each property group
                return Object.entries(propertyGroups).map(([key, propertyBookings]) => {
                  const [propertyId, propertyName] = key.split('-');
                  return (
                    <div key={key} className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 px-4 py-2 bg-gray-50 border-b">
                        {propertyName} ({propertyBookings.length} bookings)
                      </h3>
                      <div className="hidden sm:block">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Property
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  User
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Visit Date
                                </th>
                                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {propertyBookings.map(booking => {
                                const bookingId = booking.id || booking.bookingId;
                                const userName = booking.user?.name || booking.userName || 'Unknown User';
                                const userContact = extractContactInfo(booking);
                                const visitDate = booking.visitDate || booking.date;
                                const bookingStatus = booking.status || booking.bookingStatus || 'PENDING';
                                
                                return (
                                  <tr key={bookingId} className="hover:bg-gray-50 cursor-pointer" onClick={() => openBookingModal(booking)}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{propertyName}</div>
                                      {propertyId && (
                                        <div className="text-xs text-gray-500">ID: {propertyId}</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">{userName}</div>
                                      {userContact && (
                                        <div className="text-xs text-gray-500">{userContact}</div>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {new Date(visitDate).toLocaleDateString()}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <BookingStatusBadge status={bookingStatus} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end space-x-2">
                                        <button 
                                          onClick={(e) => { 
                                            e.stopPropagation(); 
                                            openBookingModal(booking);
                                          }}
                                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {/* Mobile Card View */}
                      <div className="sm:hidden">
                        <ul className="divide-y divide-gray-200">
                          {propertyBookings.map(booking => {
                            const bookingId = booking.id || booking.bookingId;
                            const propertyName = booking.property?.name || booking.propertyName || 'Unknown Property';
                            const userName = booking.user?.name || booking.userName || 'Unknown User';
                            const userContact = extractContactInfo(booking);
                            const visitDate = booking.visitDate || booking.date;
                            const bookingStatus = booking.status || booking.bookingStatus || 'PENDING';
                            
                            return (
                              <li key={bookingId} className="px-4 py-3 hover:bg-gray-50" onClick={() => openBookingModal(booking)}>
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-900">{propertyName}</p>
                                    <div className="text-xs text-gray-500 space-y-1">
                                      <p className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {userName}
                                      </p>
                                      {userContact && (
                                        <p className="flex items-center">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                          </svg>
                                          {userContact}
                                        </p>
                                      )}
                                      <p className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(visitDate).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <BookingStatusBadge status={bookingStatus} />
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  );
                });
              })()}
            </>
          )}
        </div>

        {/* Pagination */}
        {paginationDisplay()}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeBookingModal}></div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="absolute top-0 right-0 pt-3 pr-3">
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={closeBookingModal}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                        Booking Details
                      </h3>
                      
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Property Information</h4>
                        <p className="text-sm text-gray-900">
                          {selectedBooking.property?.name || selectedBooking.propertyName || 'Unknown Property'}
                        </p>
                        {selectedBooking.property?.address && (
                          <p className="text-xs text-gray-500 mt-1">
                            {selectedBooking.property.address}
                          </p>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">User Information</h4>
                        <p className="text-sm text-gray-900">
                          {selectedBooking.user?.name || selectedBooking.userName || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {extractContactInfo(selectedBooking) || 'No contact information'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Visit Information</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-sm text-gray-900">
                              {new Date(selectedBooking.visitDate || selectedBooking.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <div className="mt-1">
                              <BookingStatusBadge status={selectedBooking.status || selectedBooking.bookingStatus || 'PENDING'} />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Booking ID</p>
                            <p className="text-sm text-gray-900 truncate">
                              {selectedBooking.id || selectedBooking.bookingId || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Update Booking Form */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Update Booking</h4>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label htmlFor="updateDate" className="block text-xs font-medium text-gray-700 mb-1">
                              Visit Date
                            </label>
                            <input
                              type="date"
                              id="updateDate"
                              value={updatedVisitDate || ''}
                              onChange={(e) => setUpdatedVisitDate(e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="updateStatus" className="block text-xs font-medium text-gray-700 mb-1">
                              Status
                            </label>
                            <select
                              id="updateStatus"
                              value={updatedStatus || (selectedBooking.status || selectedBooking.bookingStatus || 'PENDING')}
                              onChange={(e) => setUpdatedStatus(e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="CANCELLED">Cancelled</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            className="inline-flex justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            onClick={() => deleteBooking(selectedBooking.id || selectedBooking.bookingId)}
                          >
                            Delete Booking
                          </button>
                          <button
                            type="button"
                            className="inline-flex justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={handleUpdateBooking}
                          >
                            Update Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default BookingsPage; 