import axios from 'axios';

/**
 * API Client Configuration
 * Base API client with interceptors for authentication and error handling
 */

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get authentication token from localStorage with expiration check
 * @returns {string|null} The authentication token or null if no valid token exists
 */
const getAuthToken = () => {
  const token = localStorage.getItem('auth_token');
  const expiry = localStorage.getItem('token_expiry');
  
  // Check if token exists
  if (!token) return null;
  
  // Check if token is expired
  if (expiry) {
    const isExpired = new Date() > new Date(expiry);
    if (isExpired) {
      // Clear expired token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('user_data');
      return null;
    }
  }
  
  return token;
};

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    
    // Only add token if it exists and has a valid format (basic validation)
    if (token && typeof token === 'string' && token.trim() !== '') {
      // Log request with token (without showing the actual token value)
      console.debug(`API Request with auth token: ${config.method.toUpperCase()} ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Debug API responses to help understand structure
    console.debug('API Response:', response.config.url, response.data);
    
    return response.data;
  },
  (error) => {
    // Debug API errors to help understand structure
    if (error.response) {
      console.debug('API Error:', error.response.config.url, error.response.data);
    } else {
      console.debug('Network Error:', error.message);
    }
    
    // Handle response errors
    const { response } = error;
    
    if (response) {
      // Handle authentication errors
      if (response.status === 401 || response.status === 403 || 
         (response.data && response.data.message && 
          typeof response.data.message === 'string' && 
          (response.data.message.toLowerCase().includes('unauthorized') || 
           response.data.message.toLowerCase().includes('token') || 
           response.data.message.toLowerCase().includes('auth')))) {
        
        console.warn('Authentication error detected, clearing auth state');
        
        // Clear auth state
        localStorage.removeItem('auth_token');
        localStorage.removeItem('token_expiry');
        localStorage.removeItem('user_data');
        
        // Dispatch event for unauthorized to show login modal
        document.dispatchEvent(new CustomEvent('auth:unauthorized', {
          detail: { 
            requestUrl: response.config.url,
            status: response.status,
            message: response.data && response.data.message ? response.data.message : 'Session expired. Please login again.'
          }
        }));
      }
      
      // Extract API error message if available
      if (response.data) {
        if (response.data.message) {
          error.message = response.data.message;
        } else if (response.data.error) {
          error.message = response.data.error;
        }
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to extract data from API response
 * @param {Object} response - The API response
 * @returns {*} The extracted data from the response
 */
api.extractData = (response) => {
  if (!response) {
    return null;
  }
  
  // If response is an ApiResponse wrapper
  if (typeof response === 'object' && 
      response.hasOwnProperty('data') && 
      response.hasOwnProperty('success')) {
    
    if (!response.success) {
      console.warn('Unsuccessful API Response:', response.message);
      return null;
    }
    
    return response.data;
  }
  
  // Otherwise return the original response
  return response;
};

export default api; 