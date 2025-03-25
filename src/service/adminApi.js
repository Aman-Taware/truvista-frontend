import api from '../api/index';

/**
 * Admin API Service
 * This file contains implementations for admin-related API calls
 */
const adminApi = {
  // Helper function to extract data from API responses
  extractData: (response) => {
    console.log('Extracting data from response:', response);
    
    // Handle null or undefined response
    if (!response) {
      console.warn('Response is null or undefined');
      return null;
    }
    
    // Handle response with data property
    if (response.data !== undefined) {
      console.log('Response has data property');
      
      // Spring Boot ApiResponse structure: { success, message, data }
      if (response.data.success !== undefined && response.data.data !== undefined) {
        console.log('Response has ApiResponse structure with success and data');
        return response.data.data;
      }
      
      // Spring Boot Page structure: { content, totalPages, totalElements, etc. }
      if (response.data.content !== undefined && Array.isArray(response.data.content)) {
        console.log('Response has Spring Page structure with content array');
        return response.data;
      }
      
      // Direct data in response.data
      console.log('Response has direct data in response.data');
      return response.data;
    }
    
    // If response itself is the data (rare case)
    console.warn('Response does not contain data property, returning response itself');
    return response;
  },
  
  // Get all bookings with optional filtering
  getFilteredBookings: async (params) => {
    try {
      console.log('Fetching filtered bookings with params:', params);
      const response = await api.get('/api/admin/bookings/filter', {
        params: params
      });
      
      // Log raw response for debugging
      console.log('Raw filtered bookings response:', response);
      
      // Handle the response data properly
      const data = adminApi.extractData(response);
      
      // Log extracted data for debugging
      console.log('Extracted filtered bookings data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching filtered bookings:', error);
      throw error;
    }
  },
  
  // Get upcoming bookings
  getUpcomingBookings: async (days = 7) => {
    try {
      console.log('Fetching upcoming bookings with days parameter:', days);
      const response = await api.get('/api/admin/bookings/upcoming', {
        params: { days }
      });
      
      // Log raw response for debugging
      console.log('Raw upcoming bookings response:', response);
      
      // Handle the response data properly
      const data = adminApi.extractData(response);
      
      // Log extracted data for debugging
      console.log('Extracted upcoming bookings data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  },
  
  // Get booking statistics
  getBookingStats: async () => {
    try {
      console.log('Fetching booking statistics');
      const response = await api.get('/api/admin/bookings/stats');
      
      // Log raw response for debugging
      console.log('Raw booking stats response:', response);
      
      // Handle the response data properly
      const data = adminApi.extractData(response);
      
      // Log extracted data for debugging
      console.log('Extracted booking stats data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      throw error;
    }
  },
  
  // Get detailed booking statistics
  getDetailedBookingStats: async () => {
    try {
      console.log('Fetching detailed booking statistics');
      const response = await api.get('/api/admin/bookings/detailed-stats');
      
      // Log raw response for debugging
      console.log('Raw detailed booking stats response:', response);
      
      // Handle the response data properly
      const data = adminApi.extractData(response);
      
      // Log extracted data for debugging
      console.log('Extracted detailed booking stats data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching detailed booking stats:', error);
      throw error;
    }
  },
  
  // Update a booking
  updateBooking: async (id, bookingData) => {
    try {
      console.log(`Updating booking with ID: ${id}`, bookingData);
      const response = await api.patch(`/api/admin/bookings/${id}`, bookingData);
      
      const data = adminApi.extractData(response);
      console.log('Booking update response:', data);
      
      return data;
    } catch (error) {
      console.error(`Error updating booking with ID: ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a booking
  deleteBooking: async (id) => {
    try {
      console.log(`Deleting booking with ID: ${id}`);
      const response = await api.delete(`/api/admin/bookings/${id}`);
      
      const data = adminApi.extractData(response);
      console.log('Booking deletion response:', data);
      
      return data;
    } catch (error) {
      console.error(`Error deleting booking with ID: ${id}:`, error);
      throw error;
    }
  }
};

export default adminApi; 