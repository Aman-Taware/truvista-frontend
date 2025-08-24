import api from './index';

/**
 * User API Service
 * Provides methods for user profile operations
 */
const userApi = {
  /**
   * Get the current user's profile
   * @returns {Promise} User profile data
   */
  getProfile: async () => {
    try {
      // Check if user is already known to be logged out
      if (typeof api.isUserLoggedOut === 'function' && api.isUserLoggedOut()) {
        console.log("Skipping profile fetch - user is known to be logged out");
        throw new Error('User is logged out. Please login again.');
      }
      
      return await api.get('/api/users/profile', { 
        withCredentials: true,
        // Add a unique timestamp to prevent duplicate cancellation
        // when needed in quick succession from different components
        params: { _t: Date.now() }
      });
    } catch (error) {
      // Passthrough specific errors we want to handle at the component level
      if (error.message === 'Duplicate request cancelled' || 
          error.message === 'User is logged out. Please login again.') {
        console.log(`Special error case: ${error.message}`);
        throw error;
      }
      
      // Specifically handle authentication errors
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error during profile fetch:', error.response.status);
        
        // Let the global handler manage this, but still throw so the component can respond
        throw new Error('Your session has expired. Please login again.');
      }
      
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} Updated user profile
   */
  updateProfile: async (profileData) => {
    try {
      return await api.put('/api/users/profile', profileData, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  /**
   * Update user password
   * @param {Object} passwordData - Old and new password
   * @returns {Promise} Success/failure response
   */
  updatePassword: async (passwordData) => {
    try {
      return await api.put('/api/users/password', passwordData, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },
  
  /**
   * Get user's shortlisted properties
   * @returns {Promise} List of shortlisted properties
   */
  getShortlist: async () => {
    try {
      return await api.get('/api/users/shortlist', { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Error fetching shortlist:', error);
      throw error;
    }
  },
  
  /**
   * Add a property to user's shortlist
   * @param {number} propertyId - Property ID to add
   * @returns {Promise} Success/failure response
   */
  addToShortlist: async (propertyId) => {
    try {
      return await api.post('/api/users/shortlist', { propertyId }, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Error adding to shortlist:', error);
      throw error;
    }
  },
  
  /**
   * Remove a property from user's shortlist
   * @param {number} propertyId - Property ID to remove
   * @returns {Promise} Success/failure response
   */
  removeFromShortlist: async (propertyId) => {
    try {
      return await api.delete(`/api/users/shortlist/${propertyId}`, { 
        withCredentials: true 
      });
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      throw error;
    }
  },
  
  /**
   * Check if a property is in user's shortlist
   * @param {number} propertyId - Property ID to check
   * @returns {Promise<boolean>} True if property is shortlisted
   */
  isPropertyShortlisted: async (propertyId) => {
    try {
      const response = await api.get(`/api/users/shortlist/check/${propertyId}`, { 
        withCredentials: true 
      });
      
      // Response can be in various formats
      if (typeof response === 'boolean') {
        return response;
      }
      
      if (response && response.data !== undefined) {
        return !!response.data;
      }
      
      if (response && response.shortlisted !== undefined) {
        return !!response.shortlisted;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking shortlist status:', error);
      return false;
    }
  },
  
  // Get specific user profile (must have permission)
  getUserProfile: (id) => 
    api.get(`/api/users/${id}`),
  
  // For backwards compatibility - redirects to updated endpoints
  updateUserProfile: (profileData) => {
    console.warn('userApi.updateUserProfile is deprecated. Use userApi.updateProfile instead.');
    return api.put('/api/users/profile', profileData);
  },
  
  // Admin user management APIs
  
  // Get all users with pagination and filtering (admin only)
  getAdminUsers: (params) => 
    api.get('/api/admin/users', { params }),
  
  // Get specific user details (admin only)
  getAdminUser: (id) => 
    api.get(`/api/admin/users/${id}`),
  
  // Update user data (admin only)
  updateAdminUser: (id, userData) => 
    api.put(`/api/admin/users/${id}`, userData),
  
  // Helper method to extract data from API response with proper error handling
  extractData: (response) => {
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

export default userApi; 