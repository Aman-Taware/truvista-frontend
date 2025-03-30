import axios from 'axios';
import { API_URL } from '../config/constants';

/**
 * API Client Configuration
 * Base API client with interceptors for authentication and error handling
 * Updated to use cookie-based authentication and prevent recursive API calls
 */

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Track ongoing requests to prevent duplicates
const ongoingRequests = new Map();
// Global auth state - IMPORTANT: Default to NOT logged out to allow auth check on startup
let userLoggedOut = false; // Start with false to attempt auth on startup
let refreshingToken = false;

// Debug mode for API calls
const DEBUG = process.env.NODE_ENV === 'development';

// Export function to check if the user is logged out from anywhere in the app
window.isUserLoggedOut = () => userLoggedOut;

// Export function to reset logged out state from anywhere in the app
window.resetLoggedOutState = () => {
  userLoggedOut = false;
  if (DEBUG) {
    console.log('Global logged out state reset (window method)');
  }
};

/**
 * Interceptor to add request timestamp and prevent duplicate requests
 */
api.interceptors.request.use(
  async (config) => {
    // Add timestamp to prevent caching
    if (!config.params) {
      config.params = {};
    }
    config.params._t = Date.now();

    // Skip duplicate request prevention for specific cases
    if (config._skipDuplicate) {
      return config;
    }

    // Generate a unique request ID based on method, URL, and params
    const requestKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
    
    // Cancel duplicate requests (unless explicitly allowed)
    if (ongoingRequests.has(requestKey)) {
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort('Duplicate request cancelled');
      console.warn(`Duplicate request prevented: ${config.method.toUpperCase()} ${config.url}`);
      return config;
    }

    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    ongoingRequests.set(requestKey, source);
    
    // Add a cleanup function to remove the request from tracking
    config._requestKey = requestKey;

    // Debug logging in development
    if (DEBUG) {
      console.debug(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor to handle responses and authentication
 */
api.interceptors.response.use(
  (response) => {
    // Clean up ongoing request tracking
    if (response.config._requestKey) {
      ongoingRequests.delete(response.config._requestKey);
    }

    // Debug logging in development
    if (DEBUG) {
      console.debug(`API Response ${response.status}: ${response.config.method.toUpperCase()} ${response.config.url}`);
    }

    // For successful auth-related responses, ensure logged out flag is reset
    if (response.config.url.includes('/api/auth/') || response.config.url.includes('/api/users/profile')) {
      if (DEBUG) {
        console.debug('Auth-related API success, ensuring logged out state is reset');
      }
      userLoggedOut = false;
    }

    // Handle different response formats
    if (response.data) {
      // If the response has our API wrapper format with success flag
      if (response.data.hasOwnProperty('success') && response.data.hasOwnProperty('data')) {
        if (response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || 'Request failed');
        }
      }
      
      // Otherwise, return as-is
      return response.data;
    }

    return response;
  },
  async (error) => {
    // Clean up ongoing request tracking
    if (error.config?._requestKey) {
      ongoingRequests.delete(error.config._requestKey);
    }

    // Ignore canceled requests (from our duplicate prevention)
    if (axios.isCancel(error)) {
      console.log('Request canceled:', error.message);
      return Promise.reject(new Error('Duplicate request cancelled'));
    }

    // Handle server errors with detailed logging
    console.error(`API Error ${error.response?.status || 'Network'}: ${error.config?.method?.toUpperCase() || 'UNKNOWN'} ${error.config?.url || 'UNKNOWN'}`);
    if (error.response?.data) {
      console.error('Error response data:', error.response.data);
    }

    // Special handling for 401 Unauthorized errors to handle token refresh
    if (error.response?.status === 401 && !error.config?._skipAuthRetry) {
      // Check if user is already logged out to prevent cycles
      if (userLoggedOut) {
        console.warn('User is already logged out. Not attempting token refresh.');
        return Promise.reject(error);
      }

      // Refresh endpoint itself returns 401
      if (error.config.url.includes('/api/auth/refresh')) {
        console.warn('Token refresh failed with 401. Marking user as logged out.');
        userLoggedOut = true;
        
        // Dispatch event for session expiration
        window.dispatchEvent(new CustomEvent('auth:sessionExpired', { 
          detail: { 
            reason: 'refresh_token_missing',
            message: error.response?.data?.message || 'Session expired'
          }
        }));
        
        return Promise.reject(error);
      }

      // Try to refresh the token
      try {
        if (!refreshingToken) {
          refreshingToken = true;
          console.log('Attempting to refresh token due to 401 response');
          
          // Trigger token refresh
          window.dispatchEvent(new CustomEvent('auth:tokenRefreshNeeded'));
          
          // Now let the auth system handle the token refresh
          // We don't try to handle it here to avoid circular dependencies
          
          refreshingToken = false;
        }
        
        // Always reject the original request
        return Promise.reject(error);
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        userLoggedOut = true;
        
        // Dispatch event for session expiration
        window.dispatchEvent(new CustomEvent('auth:sessionExpired', { 
          detail: { 
            reason: 'refresh_failed',
            message: 'Failed to refresh authentication'
          }
        }));
        
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Reset the logged out state (called by AuthContext after successful login)
api.resetLoggedOutState = () => {
  if (DEBUG) {
    console.log('Resetting logged out state');
  }
  userLoggedOut = false;
};

// Check if the user is logged out
api.isUserLoggedOut = () => {
  return userLoggedOut;
};

// Set the user as logged out (called by AuthContext during logout)
api.setUserLoggedOut = () => {
  if (DEBUG) {
    console.log('Setting user as logged out');
  }
  userLoggedOut = true;
};

export default api; 