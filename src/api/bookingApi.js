import api from './index';

/**
 * Booking API Service
 * Provides methods for booking-related operations
 */
const bookingApi = {
  /**
   * Create a new booking for a specific property
   * @param {number} propertyId - Property ID to book
   * @param {Object} bookingData - Booking information
   * @returns {Promise} Created booking data
   */
  createBooking: async (propertyId, bookingData) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log("Skipping booking creation - user is logged out");
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.post(`/api/bookings/properties/${propertyId}`, bookingData, {
        withCredentials: true
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error('Error creating booking:', error);
      throw error;
    }
  },
  
  /**
   * Get user's bookings
   * @param {Object} params - Optional query parameters
   * @returns {Promise} List of bookings
   */
  getUserBookings: async (params = {}) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log("Skipping bookings fetch - user is logged out");
        throw new Error('User is logged out. Please login again.');
      }
      
      // Ensure we always have a timestamp to prevent duplicate request cancellation
      const queryParams = {
        ...params,
        _t: params._t || Date.now() // Use provided timestamp or create a new one
      };
      
      return await api.get('/api/bookings', { 
        params: queryParams,
        withCredentials: true 
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },
  
  /**
   * Get user's bookings (alias for backward compatibility)
   * @param {Object} params - Optional query parameters
   * @returns {Promise} List of bookings
   */
  getBookings: async (params = {}) => {
    return bookingApi.getUserBookings(params);
  },
  
  /**
   * Get a specific booking by ID
   * @param {number} id - Booking ID
   * @returns {Promise} Booking details
   */
  getBooking: async (id) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log(`Skipping booking fetch (ID: ${id}) - user is logged out`);
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.get(`/api/bookings/${id}`, { 
        withCredentials: true,
        params: { _t: Date.now() } // Add timestamp to prevent caching
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Update booking (visit date or status)
   * @param {number} id - Booking ID
   * @param {Object} bookingData - Data to update
   * @returns {Promise} Updated booking
   */
  updateBooking: async (id, bookingData) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log(`Skipping booking update (ID: ${id}) - user is logged out`);
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.put(`/api/bookings/${id}`, bookingData, { 
        withCredentials: true 
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error(`Error updating booking ${id}:`, error);
      throw error;
    }
  },
  
  // Admin API endpoints
  
  /**
   * Get all bookings with pagination and filtering (admin only)
   * @param {Object} params - Query parameters (page, size, status, etc)
   * @returns {Promise} Paginated bookings
   */
  getAdminBookings: async (params = {}) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log("Skipping admin bookings fetch - user is logged out");
        throw new Error('User is logged out. Please login again.');
      }
      
      // Ensure we always have a timestamp to prevent duplicate request cancellation
      const queryParams = {
        ...params,
        _t: params._t || Date.now() // Use provided timestamp or create a new one
      };
      
      return await api.get('/api/admin/bookings', { 
        params: queryParams,
        withCredentials: true 
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error('Error fetching admin bookings:', error);
      throw error;
    }
  },
  
  /**
   * Get booking statistics (admin only)
   * @returns {Promise} Booking statistics
   */
  getAdminBookingStats: async () => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log("Skipping admin booking stats fetch - user is logged out");
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.get('/api/admin/bookings/stats', { 
        params: { _t: Date.now() }, // Prevent duplicates
        withCredentials: true 
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error('Error fetching booking statistics:', error);
      throw error;
    }
  },
  
  /**
   * Get specific booking details (admin only)
   * @param {number} id - Booking ID
   * @returns {Promise} Booking details
   */
  getAdminBooking: async (id) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log(`Skipping admin booking fetch (ID: ${id}) - user is logged out`);
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.get(`/api/admin/bookings/${id}`, { 
        withCredentials: true,
        params: { _t: Date.now() } // Add timestamp to prevent caching
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error(`Error fetching admin booking ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Update booking status (admin only)
   * @param {number} id - Booking ID
   * @param {Object} bookingData - Data to update
   * @returns {Promise} Updated booking
   */
  updateAdminBooking: async (id, bookingData) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log(`Skipping admin booking update (ID: ${id}) - user is logged out`);
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.put(`/api/admin/bookings/${id}`, bookingData, { 
        withCredentials: true 
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error(`Error updating admin booking ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete booking (admin only)
   * @param {number} id - Booking ID to delete
   * @returns {Promise} Response
   */
  deleteAdminBooking: async (id) => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log(`Skipping admin booking deletion (ID: ${id}) - user is logged out`);
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.delete(`/api/admin/bookings/${id}`, { 
        withCredentials: true 
      });
    } catch (error) {
      if (error.message === 'User is logged out. Please login again.' ||
          error.message === 'Duplicate request cancelled') {
        throw error;
      }
      
      console.error(`Error deleting booking ${id}:`, error);
      throw error;
    }
  },
  
  // Helper method to extract data from API response with proper error handling
  extractData: (response) => {
    // If response is already an array, return it directly
    if (Array.isArray(response)) {
      return response;
    }
    
    // Handle nested response structures
    if (response && response.data) {
      // If the response has a data.data structure (ApiResponse wrapper)
      if (response.data.data !== undefined) {
        return response.data.data;
      }
      // If the response has direct data
      return response.data;
    }
    return null;
  }
};

export default bookingApi; 