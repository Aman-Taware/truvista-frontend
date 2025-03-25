import api from './index';

/**
 * Booking API Service
 * This file contains implementations for booking-related API calls
 */

// Booking API object
const bookingApi = {
  // Create a new booking for a specific property
  createBooking: (propertyId, bookingData) => 
    api.post(`/api/bookings/properties/${propertyId}`, bookingData),
  
  // Get user's bookings
  getBookings: () => 
    api.get('/api/bookings'),
  
  // Get user's bookings (alias for getBookings with a more descriptive name)
  getUserBookings: () => 
    api.get('/api/bookings'),
  
  // Get a specific booking by ID
  getBooking: (id) => 
    api.get(`/api/bookings/${id}`),
  
  // Update booking (visit date or status)
  updateBooking: (id, bookingData) => 
    api.put(`/api/bookings/${id}`, bookingData),
  
  // Cancel booking feature has been completely removed
  
  // Admin API endpoints
  
  // Get all bookings with pagination and filtering (admin only)
  getAdminBookings: (params) => 
    api.get('/api/admin/bookings', { params }),
  
  // Get booking statistics (admin only)
  getAdminBookingStats: () => 
    api.get('/api/admin/bookings/stats'),
  
  // Get specific booking details (admin only)
  getAdminBooking: (id) => 
    api.get(`/api/admin/bookings/${id}`),
  
  // Update booking status (admin only)
  updateAdminBooking: (id, bookingData) => 
    api.put(`/api/admin/bookings/${id}`, bookingData),
  
  // Delete booking (admin only)
  deleteAdminBooking: (id) => 
    api.delete(`/api/admin/bookings/${id}`),
  
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