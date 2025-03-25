import api from './index';

/**
 * Property API Service
 * This file contains implementations for property-related API calls
 */

// Property API object
const propertyApi = {
  // Get all properties with filtering and pagination
  getProperties: async (filters = {}) => {
    const response = await api.get('/api/properties', { params: filters });
    return propertyApi.normalizePropertyDataFromBackend(propertyApi.extractData(response));
  },

  /**
   * Get detailed property information by ID
   * @param {number} id - Property ID
   * @returns {Promise<Object>} Property details including associated entities
   * like flats, characteristics, amenities, media, and assignedUser 
   */
  getPropertyById: async (id) => {
    const response = await api.get(`/api/properties/${id}`);
    return propertyApi.normalizePropertyDataFromBackend(propertyApi.extractData(response));
  },
  
  // Get featured properties
  getFeaturedProperties: async () => {
    try {
      console.log('Calling getFeaturedProperties API...');
      const response = await api.get('/api/properties/featured');
      console.log('Raw API response:', response);
      
      // Check if response is already unwrapped by axios interceptor
      if (response && typeof response === 'object') {
        if (response.data !== undefined) {
          // Response follows ApiResponse pattern
          console.log('Response has ApiResponse structure with data property');
          const normalizedData = propertyApi.normalizePropertyDataFromBackend(response.data);
          return normalizedData;
        } else if (Array.isArray(response)) {
          // Response is already an array
          console.log('Response is already an array');
          const normalizedData = propertyApi.normalizePropertyDataFromBackend(response);
          return normalizedData;
        }
      }
      
      // Default case - try to extract and normalize
      console.log('Using default extraction logic');
      return propertyApi.normalizePropertyDataFromBackend(propertyApi.extractData(response));
    } catch (error) {
      console.error('Error fetching featured properties:', error);
      throw error;
    }
  },
  
  // Get property stats (not in controller - may need implementation on backend)
  getPropertyStats: async () => {
    return api.get('/api/properties/stats');
  },
  
  // Search properties with advanced filters
  searchProperties: async (searchParams = {}) => {
    try {
      console.log('Original search params:', searchParams);
      console.log('Current page being requested:', searchParams.page);
      
      // Make sure to clean up parameters before sending to backend
      const cleanParams = { ...searchParams };
      
      // If priceRange exists, convert it to minPrice and maxPrice (backwards compatibility)
      if (cleanParams.priceRange && Array.isArray(cleanParams.priceRange) && cleanParams.priceRange.length === 2) {
        const [min, max] = cleanParams.priceRange;
        cleanParams.minPrice = min;
        cleanParams.maxPrice = max;
        delete cleanParams.priceRange;
      }
      
      // Handle flatTypes correctly - ensure it stays as a single string value
      // The backend expects a parameter without brackets: flatTypes=2BHK
      console.log('flatTypes before processing:', cleanParams.flatTypes);
      
      // Only process flatTypes if it's an array - we want a string at the end
      if (cleanParams.flatTypes && Array.isArray(cleanParams.flatTypes)) {
        // Join array elements into a single comma-separated string
        cleanParams.flatTypes = cleanParams.flatTypes.join(',');
        console.log('flatTypes converted from array to string:', cleanParams.flatTypes);
      }
      
      // No need to add spaces to flatTypes - backend expects the compact format (2BHK)
      
      // Remove any null, undefined or empty string values
      Object.keys(cleanParams).forEach(key => {
        if (cleanParams[key] === null || cleanParams[key] === undefined || 
            (typeof cleanParams[key] === 'string' && cleanParams[key] === '') ||
            (Array.isArray(cleanParams[key]) && cleanParams[key].length === 0)) {
          console.log(`Removing empty parameter: ${key}`);
          delete cleanParams[key];
        }
      });
      
      console.log('Final search params to backend:', cleanParams);
      
      // Log the actual URL that will be called
      const queryString = new URLSearchParams(
        Object.entries(cleanParams).flatMap(([key, value]) => 
          Array.isArray(value) ? value.map(v => [key, v]) : [[key, value]]
        )
      ).toString();
      console.log('Full API URL:', `/api/properties/search?${queryString}`);
      
      const response = await api.get('/api/properties/search', { params: cleanParams });
      console.log('Raw API response:', response);
      
      // Extract data with normalization
      const responseData = propertyApi.extractData(response);
      console.log('Extracted response data:', responseData);
      
      if (responseData) {
        // For paginated data, normalize the content array
        if (responseData.content) {
          responseData.content = propertyApi.normalizePropertyDataFromBackend(responseData.content);
          return { 
            success: true, 
            data: responseData
          };
        }
        
        return { 
          success: true, 
          data: responseData
        };
      }
      
      console.error('Unable to extract data from response:', response);
      return { 
        success: false, 
        message: 'Invalid response format', 
        data: { content: [], totalElements: 0, last: true, totalPages: 0 } 
      };
    } catch (error) {
      console.error('Error searching properties:', error);
      console.error('Error details:', error.response?.data || error.message);
      
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Error searching properties', 
        data: { content: [], totalElements: 0, last: true, totalPages: 0 } 
      };
    }
  },
  
  // Book site visit - redirected to bookingApi
  bookSiteVisit: async (propertyId, bookingData) => {
    console.warn('propertyApi.bookSiteVisit is deprecated. Use bookingApi.createBooking instead.');
    return api.post(`/api/bookings/properties/${propertyId}`, bookingData);
  },
  
  // Add to shortlist - redirected to shortlistApi
  addToShortlist: async (propertyId) => {
    console.warn('propertyApi.addToShortlist is deprecated. Use shortlistApi.addToShortlist instead.');
    return api.post(`/api/shortlists/properties/${propertyId}/toggle`);
  },
  
  // Remove from shortlist - redirected to shortlistApi
  removeFromShortlist: async (shortlistId) => {
    console.warn('propertyApi.removeFromShortlist is deprecated. Use shortlistApi.removeFromShortlist instead.');
    return api.delete(`/api/shortlists/${shortlistId}`);
  },
  
  // Helper method to extract data from API response with proper error handling
  extractData: (response) => {
    console.log('extractData called with:', response);
    
    if (!response) {
      console.warn('extractData: Response is null or undefined');
      return null;
    }
    
    // If response is an ApiResponse wrapper with success and data fields
    if (response && typeof response === 'object') {
      if (response.success === true && response.data !== undefined) {
        console.log('extractData: Found ApiResponse wrapper with success=true');
        return response.data;
      }
      
      // If it has a data.data structure (nested ApiResponse wrapper)
      if (response.data && response.data.data !== undefined) {
        console.log('extractData: Found nested data.data structure');
        return response.data.data;
      }
      
      // If it's a direct data object or array
      if (response.data) {
        console.log('extractData: Using direct data property');
        return response.data;
      }
      
      // If it's already an unwrapped array or object
      if (Array.isArray(response) || (typeof response === 'object' && !response.hasOwnProperty('data'))) {
        console.log('extractData: Response appears to be already unwrapped');
        return response;
      }
    }
    
    console.warn('extractData: Unable to extract data from response:', response);
    return null;
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
      return propertyData.map(propertyApi.normalizePropertyDataFromBackend);
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
  }
};

export default propertyApi; 