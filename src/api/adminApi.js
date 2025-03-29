import api from './index';
import axios from 'axios';

/**
 * Admin API Service
 * This file contains implementations for admin-related API calls
 * Matches the backend AdminController endpoints
 */
const adminApi = {
  // ===============================================================
  // DASHBOARD & STATISTICS
  // ===============================================================
  
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} The dashboard statistics including properties, bookings, users, and revenue data
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return adminApi.extractData(response);
    } catch (error) {
      adminApi.handleApiError(error);
    }
  },
  
  // ===============================================================
  // PROPERTY MANAGEMENT
  // ===============================================================
  
  /**
   * Create a new property
   * @param {Object} propertyData - Property creation data (CreatePropertyDTO)
   * @returns {Promise} Created property
   */
  createProperty: async (propertyData) => {
    const normalizedData = adminApi.normalizePropertyDataForBackend(propertyData);
    const response = await api.post('/api/admin/properties', normalizedData);
    return adminApi.normalizePropertyDataFromBackend(adminApi.extractData(response));
  },
  
  /**
   * Get all properties
   * @returns {Promise} List of all properties
   */
  getAllProperties: async () => {
    const response = await api.get('/api/admin/properties');
    return adminApi.normalizePropertyDataFromBackend(adminApi.extractData(response));
  },
  
  /**
   * Get property by ID
   * @param {number} id - Property ID
   * @returns {Promise} Property details
   */
  getPropertyById: async (id) => {
    const response = await api.get(`/api/admin/properties/${id}`);
    return adminApi.normalizePropertyDataFromBackend(adminApi.extractData(response));
  },
  
  /**
   * Update a property completely
   * @param {number} id - Property ID
   * @param {Object} propertyData - Full property update data (UpdatePropertyDTO)
   * @returns {Promise} Updated property
   */
  updateProperty: async (id, propertyData) => {
    const normalizedData = adminApi.normalizePropertyDataForBackend(propertyData);
    const response = await api.put(`/api/admin/properties/${id}`, normalizedData);
    return adminApi.normalizePropertyDataFromBackend(adminApi.extractData(response));
  },
  
  /**
   * Update a property partially
   * @param {number} id - Property ID
   * @param {Object} patchData - Partial property update data (PatchPropertyDTO)
   * @returns {Promise} Updated property
   */
  patchProperty: async (id, patchData) => {
    const normalizedData = adminApi.normalizePropertyDataForBackend(patchData);
    const response = await api.patch(`/api/admin/properties/${id}`, normalizedData);
    return adminApi.normalizePropertyDataFromBackend(adminApi.extractData(response));
  },
  
  /**
   * Delete a property
   * @param {number} id - Property ID
   * @returns {Promise} Success response
   */
  deleteProperty: (id) => 
    api.delete(`/api/admin/properties/${id}`),
  
  // ===============================================================
  // MEDIA MANAGEMENT
  // ===============================================================
  
  /**
   * Get all media for a property
   * @param {number} propertyId - Property ID
   * @returns {Promise} List of media items for the property
   */
  getPropertyMedia: async (propertyId) => {
    try {
      console.log(`Fetching media for property with ID: ${propertyId}`);
      const response = await api.get(`/api/admin/properties/${propertyId}/media`);
      console.log('Media fetch successful:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error fetching property media:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch media';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Upload media for a property
   * @param {number} propertyId - Property ID
   * @param {File} file - File to upload
   * @param {string} mediaType - Type of media (PROPERTY_IMAGE, LAYOUT, BROCHURE, QR_CODE)
   * @param {function} onProgress - Optional callback for upload progress
   * @returns {Promise} Uploaded media info
   */
  uploadMedia: async (propertyId, file, mediaType, onProgress) => {
    try {
      console.log(`Uploading media for property ${propertyId}, type: ${mediaType}`);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);
      
      const response = await api.post(`/api/admin/properties/${propertyId}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add upload progress tracking
        onUploadProgress: onProgress ? 
          progressEvent => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          } : undefined,
        // Increase timeout for larger files
        timeout: 300000, // 5 minutes
        // Buffer size optimizations
        maxBodyLength: 50 * 1024 * 1024, // 50MB max upload size
        maxContentLength: 50 * 1024 * 1024 // 50MB max content length
      });
      
      console.log('Media upload successful:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error uploading media:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload media';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Upload multiple media files for a property
   * @param {number} propertyId - Property ID
   * @param {FormData} formData - FormData containing files and type
   * @returns {Promise} Uploaded media info
   */
  uploadPropertyMedia: async (propertyId, formData) => {
    try {
      console.log(`Uploading multiple files for property ${propertyId}, type: ${formData.get('type')}`);
      
      const response = await api.post(`/api/admin/properties/${propertyId}/media/batch`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
      
      console.log('Batch media upload successful:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error uploading media batch:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to upload media files';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Get a specific media item by ID
   * @param {number} mediaId - Media ID
   * @returns {Promise} Media item details
   */
  getMediaById: async (mediaId) => {
    try {
      console.log(`Fetching media with ID: ${mediaId}`);
      const response = await api.get(`/api/admin/media/${mediaId}`);
      console.log('Media fetch successful:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error fetching media:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch media';
      throw new Error(errorMessage);
    }
  },
  
  /**
   * Delete property media
   * @param {number} mediaId - Media ID
   * @returns {Promise} Success response
   */
  deleteMedia: async (mediaId) => {
    try {
      console.log(`Deleting media with ID: ${mediaId}`);
      const response = await api.delete(`/api/admin/media/${mediaId}`);
      console.log('Media deletion successful:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error deleting media:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete media';
      throw new Error(errorMessage);
    }
  },
  
  // ===============================================================
  // BOOKING MANAGEMENT
  // ===============================================================
  
  /**
   * Gets bookings with filtering options
   * @param {Object} params - Query parameters for filtering bookings
   * @returns {Promise<Array>} Array of bookings
   */
  getBookings: async (params) => {
    try {
      const response = await api.get('/api/admin/bookings', {
        params: params
      });
      
      console.log('getBookings raw response:', response);
      const data = adminApi.extractData(response);
      console.log('getBookings extracted data:', data);
      
      // Ensure we always return an array
      if (data && data.content && Array.isArray(data.content)) {
        return data; // Return paginated response
      }
      
      if (Array.isArray(data)) {
        return data;
      }
      
      console.warn('Unexpected booking data format:', data);
      return []; // Return empty array as fallback
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },
  
  /**
   * Gets bookings with advanced filtering, search, and pagination
   * @param {Object} params - Advanced query parameters for filtering bookings
   * @returns {Promise<Object>} Paginated bookings result
   */
  getFilteredBookings: async (params) => {
    try {
      const response = await api.get('/api/admin/bookings/filter', {
        params: params
      });
      
      // Log raw response for debugging
      console.log('getFilteredBookings raw response:', response);
      
      // Handle the response data properly
      const data = adminApi.extractData(response);
      
      // Log extracted data for debugging
      console.log('getFilteredBookings extracted data:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching filtered bookings:', error);
      throw error;
    }
  },
  
  /**
   * Gets upcoming bookings for the next specified days
   * @param {number} days - Number of days to look ahead
   * @returns {Promise<Array>} Array of upcoming bookings
   */
  getUpcomingBookings: async (days = 7) => {
    try {
      const response = await api.get('/api/admin/bookings/upcoming', {
        params: { days }
      });
      console.log('getUpcomingBookings raw response:', response);
      const data = adminApi.extractData(response);
      console.log('getUpcomingBookings extracted data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
      throw error;
    }
  },
  
  /**
   * Get booking statistics
   * @returns {Promise} Booking statistics data
   */
  getBookingStats: async () => {
    try {
      const response = await api.get('/api/admin/bookings/stats');
      console.log('getBookingStats raw response:', response);
      const data = adminApi.extractData(response);
      console.log('getBookingStats extracted data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching booking statistics:', error);
      throw error;
    }
  },
  
  /**
   * Get detailed booking statistics with optional date range
   * @param {string} startDate - Optional start date (ISO format)
   * @param {string} endDate - Optional end date (ISO format)
   * @returns {Promise<Object>} Detailed booking statistics
   */
  getDetailedBookingStats: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await api.get('/api/admin/bookings/stats/detailed', {
        params: params
      });
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error fetching detailed booking statistics:', error);
      throw error;
    }
  },
  
  /**
   * Get booking by ID
   * @param {number} id - Booking ID
   * @returns {Promise} Booking details
   */
  getBookingById: async (id) => {
    try {
      const response = await api.get(`/api/admin/bookings/${id}`);
      return adminApi.extractData(response);
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a booking's status
   * @param {number} id - Booking ID
   * @param {Object} bookingData - Booking update data (AdminBookingUpdateDTO)
   * @returns {Promise} Updated booking
   */
  updateBooking: async (id, bookingData) => {
    try {
      const response = await api.patch(`/api/admin/bookings/${id}`, bookingData);
      return response.data;
    } catch (error) {
      console.error('Error updating booking:', error);
      throw error;
    }
  },
  
  /**
   * Delete a booking
   * @param {number} id - Booking ID
   * @returns {Promise} Success response
   */
  deleteBooking: async (id) => {
    try {
      const response = await api.delete(`/api/admin/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  },
  
  // ===============================================================
  // USER MANAGEMENT
  // ===============================================================
  
  /**
   * Get all users with pagination and filtering
   * @param {Object} params - Query parameters for filtering
   * @returns {Promise} Paginated list of users
   */
  getUsers: async (params = {}) => {
    try {
      console.log('Fetching users with params:', params);
      const response = await api.get('/api/admin/users', { params });
      console.log('Users response:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  /**
   * Get filtered users
   * @param {Object} params - Query parameters for filtering users
   * @returns {Promise} Filtered users
   */
  getFilteredUsers: async (params = {}) => {
    try {
      console.log('Fetching filtered users with params:', params);
      const response = await api.get('/api/admin/users/filter', { params });
      console.log('Filtered users response:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error fetching filtered users:', error);
      throw error;
    }
  },
  
  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise} User details
   */
  getUser: async (id) => {
    try {
      console.log(`Fetching user with ID: ${id}`);
      const response = await api.get(`/api/admin/users/${id}`);
      console.log('User response:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a user completely
   * @param {number} id - User ID
   * @param {Object} userData - User update data
   * @returns {Promise} Updated user
   */
  updateUser: async (id, userData) => {
    try {
      console.log(`Updating user with ID: ${id}`, userData);
      const response = await api.put(`/api/admin/users/${id}`, userData);
      console.log('Update user response:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a user partially
   * @param {number} id - User ID
   * @param {Object} patchData - Partial user update data
   * @returns {Promise} Updated user
   */
  patchUser: async (id, patchData) => {
    try {
      console.log(`Patching user with ID: ${id}`, patchData);
      const response = await api.patch(`/api/admin/users/${id}`, patchData);
      console.log('Patch user response:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error(`Error patching user with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Delete a user
   * @param {number} id - User ID
   * @returns {Promise} Success response
   */
  deleteUser: async (id) => {
    try {
      console.log(`Deleting user with ID: ${id}`);
      const response = await api.delete(`/api/admin/users/${id}`);
      console.log('Delete user response:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get user statistics
   * @returns {Promise} User statistics
   */
  getUserStats: async () => {
    try {
      console.log('Fetching user statistics');
      const response = await api.get('/api/admin/users/stats');
      console.log('User stats response:', response);
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  },
  
  /**
   * Extract data from API response, handling various response structures
   */
  extractData: (response) => {
    if (!response) return null;
    
    console.log('Extract data from response:', response);
    
    // Option 1: Standard response with data property
    if (response.data !== undefined) {
      // Option 1a: ApiResponse with data.data structure (common Spring Boot pattern)
      if (response.data.data !== undefined) {
        console.log('Extracting from data.data structure');
        return response.data.data;
      }
      
      // Option 1b: Direct data in data property
      console.log('Extracting from data property');
      return response.data;
    }
    
    // Option 2: Spring Data paginated response
    if (response.content !== undefined && Array.isArray(response.content)) {
      console.log('Extracting from paginated response');
      return response; // Return the whole paginated object to preserve pagination metadata
    }
    
    // Option 3: Data is the response itself (already extracted)
    console.log('Response is already the data');
    return response;
  },
  
  handleApiError: (error) => {
    // Implementation of handleApiError method
  },
  
  /**
   * Normalize property data when sending to the backend
   * Ensures compatibility between featured and isFeatured fields
   * The backend now uses 'featured' as the standard field name
   * 
   * @param {Object} propertyData - Property data from the frontend
   * @returns {Object} Normalized property data for the backend
   */
  normalizePropertyDataForBackend: (propertyData) => {
    if (!propertyData) return propertyData;
    
    const normalized = {...propertyData};
    
    // If only one of featured/isFeatured is present, ensure both are set
    // Prioritize 'featured' as it's the standard field name in the backend
    if (normalized.featured !== undefined && normalized.isFeatured === undefined) {
      normalized.isFeatured = normalized.featured;
    } else if (normalized.isFeatured !== undefined && normalized.featured === undefined) {
      normalized.featured = normalized.isFeatured;
    }
    
    return normalized;
  },
  
  /**
   * Normalize property data when received from the backend
   * Ensures compatibility between featured and isFeatured fields
   * The backend now uses 'featured' as the standard field name
   * 
   * @param {Object|Array} propertyData - Property data or array from the backend
   * @returns {Object|Array} Normalized property data for the frontend
   */
  normalizePropertyDataFromBackend: (propertyData) => {
    if (!propertyData) return propertyData;
    
    // Handle array of properties
    if (Array.isArray(propertyData)) {
      return propertyData.map(adminApi.normalizePropertyDataFromBackend);
    }
    
    const normalized = {...propertyData};
    
    // If only one of featured/isFeatured is present, ensure both are set
    // Prioritize 'featured' as it's the standard field name in the backend
    if (normalized.featured !== undefined && normalized.isFeatured === undefined) {
      normalized.isFeatured = normalized.featured;
    } else if (normalized.isFeatured !== undefined && normalized.featured === undefined) {
      normalized.featured = normalized.isFeatured;
    }
    
    return normalized;
  },
  
  /**
   * Upload property media file
   * @param {Number} propertyId - Property ID
   * @param {File} file - Media file to upload
   * @param {String} mediaType - Type of media (IMAGE, VIDEO, DOCUMENT)
   * @returns {Promise} Uploaded media information
   */
  uploadPropertyMedia: async (propertyId, file, mediaType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mediaType', mediaType);
      
      const response = await api.post(
        `/api/admin/properties/${propertyId}/media`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return adminApi.extractData(response);
    } catch (error) {
      adminApi.handleApiError(error);
    }
  },

  /**
   * Delete property media
   * @param {Number} mediaId - Media ID to delete
   * @returns {Promise} Success response
   */
  deletePropertyMedia: async (mediaId) => {
    try {
      const response = await api.delete(`/api/admin/media/${mediaId}`);
      return adminApi.extractData(response);
    } catch (error) {
      adminApi.handleApiError(error);
    }
  },
  
  // ===============================================================
  // PROPERTY ASSIGNMENT MANAGEMENT
  // ===============================================================

  /**
   * Get all users eligible for property assignment (admins and executives)
   * @returns {Promise<Array>} List of eligible users with minimal information
   */
  getEligibleAssignedUsers: async () => {
    try {
      const response = await api.get('/api/admin/property-assignment/eligible-users');
      return adminApi.extractData(response);
    } catch (error) {
      console.error('Error fetching eligible assigned users:', error);
      adminApi.handleApiError(error);
    }
  },

  /**
   * Get a specific eligible user by ID
   * @param {Number} userId - User ID to retrieve
   * @returns {Promise<Object>} User information if eligible
   */
  getEligibleAssignedUserById: async (userId) => {
    try {
      const response = await api.get(`/api/admin/property-assignment/eligible-users/${userId}`);
      return adminApi.extractData(response);
    } catch (error) {
      console.error(`Error fetching eligible assigned user with ID ${userId}:`, error);
      adminApi.handleApiError(error);
    }
  },
};

export default adminApi; 