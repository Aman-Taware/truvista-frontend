import api from './index';

/**
 * Shortlist API Service
 * This file contains implementations for shortlist-related API calls
 */

// Shortlist API object
const shortlistApi = {
  // Get user's shortlist
  getShortlist: () => 
    api.get('/api/shortlists'),
  
  // Check if a property is in the shortlist
  isShortlisted: (propertyId) => 
    api.get(`/api/shortlists/properties/${propertyId}/check`),
  
  // Toggle property in shortlist (add if not present, remove if present)
  toggleShortlist: (propertyId) =>
    api.post(`/api/shortlists/properties/${propertyId}/toggle`),
  
  // Remove property from shortlist
  removeFromShortlist: (shortlistId) => 
    api.delete(`/api/shortlists/${shortlistId}`),
  
  // Legacy method - use toggleShortlist instead
  addToShortlist: (propertyId) => {
    console.warn('shortlistApi.addToShortlist is deprecated. Use shortlistApi.toggleShortlist instead.');
    return api.post(`/api/shortlists/properties/${propertyId}/toggle`);
  },
  
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

export default shortlistApi; 