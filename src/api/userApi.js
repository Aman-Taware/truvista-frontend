import api from './index';

/**
 * User API Service
 * This file contains implementations for user-related API calls
 */

// User API object
const userApi = {
  // Get current user profile
  getProfile: () => 
    api.get('/api/users/profile'),
  
  // Get specific user profile (must have permission)
  getUserProfile: (id) => 
    api.get(`/api/users/${id}`),
  
  // Update user profile (must be current user or admin)
  updateProfile: (id, profileData) => 
    api.put(`/api/users/${id}`, profileData),
  
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