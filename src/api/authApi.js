import api from './index';

/**
 * Authentication API Service
 * This file contains implementations for authentication-related API calls
 */

// Auth API object
const authApi = {
  /**
   * Request OTP for authentication
   * @param {string} contactNo - The user's phone number
   * @returns {Promise} - API response
   */
  startAuth: async (contactNo) => {
    try {
      const response = await api.post('/api/auth/start', { contactNo });
      
      console.log("Raw startAuth response:", response);
      
      if (!response) {
        return {
          success: false,
          data: null,
          message: 'Invalid server response'
        };
      }
      
      // Process response based on format
      if (typeof response === 'object') {
        // If already processed by interceptor and is a string status
        if (typeof response === 'string' && (response === "LOGIN" || response === "SIGNUP")) {
          return {
            success: true,
            data: response,
            message: "OTP sent successfully"
          };
        }
        
        // If we still have ApiResponse wrapper
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            message: response.message || "OTP sent successfully"
          };
        }
        
        // If data is directly in the response
        if (response.data) {
          return {
            success: true,
            data: response.data,
            message: "OTP sent successfully"
          };
        }
      }
      
      // If we received a response (not null or undefined)
      return {
        success: true,
        data: response,
        message: "OTP sent successfully"
      };
      
    } catch (error) {
      console.error('Error requesting OTP:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to send OTP'
      };
    }
  },
  
  /**
   * Verify OTP
   * @param {string} contactNo - The user's phone number
   * @param {string} otp - The OTP to verify
   * @returns {Promise} - API response
   */
  verifyOtp: async (contactNo, otp) => {
    try {
      const response = await api.post('/api/auth/verify-otp', { contactNo, otp });
      
      console.log("Raw OTP verification response:", response);
      
      // Check if the API response contains the expected data
      if (!response) {
        return {
          success: false,
          data: null,
          message: 'Invalid server response'
        };
      }
      
      // Handle different response formats
      // 1. ApiResponse wrapper already extracted by the interceptor
      if (typeof response === 'string' && (response === "LOGIN" || response === "SIGNUP")) {
        // If the response is already the string value we want
        return {
          success: true,
          data: response,
          message: "OTP verified successfully"
        };
      }
      
      // 2. ApiResponse wrapper not yet extracted
      if (typeof response === 'object') {
        // If we still have the full ApiResponse object
        if (response.success && response.data) {
          // Return the processed response
          return {
            success: true,
            data: response.data,
            message: response.message || "OTP verified successfully"
          };
        }
        
        // If we have an object but not the expected structure
        if (response.data && typeof response.data === 'string') {
          // Try to extract from nested data property
          return {
            success: true,
            data: response.data,
            message: "OTP verified successfully"
          };
        }
      }
      
      // If we received an unexpected response format
      console.warn('Unexpected response format from verify-otp endpoint:', response);
      return {
        success: false,
        data: null,
        message: 'Unexpected response format from server'
      };
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Check for specific error messages to provide better user feedback
      if (error.message && error.message.includes('already verified')) {
        return {
          success: false,
          data: null,
          message: 'OTP already verified. Please request a new OTP.',
          code: 'OTP_ALREADY_VERIFIED'
        };
      }
      
      if (error.message && error.message.includes('expired')) {
        return {
          success: false,
          data: null,
          message: 'OTP has expired. Please request a new OTP.',
          code: 'OTP_EXPIRED'
        };
      }
      
      if (error.message && error.message.includes('Invalid OTP')) {
        return {
          success: false,
          data: null,
          message: 'Invalid OTP. Please check and try again.',
          code: 'INVALID_OTP'
        };
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to verify OTP'
      };
    }
  },
  
  /**
   * Sign up (register) a new user
   * @param {Object} userData - User registration data including contactNo and OTP
   * @returns {Promise} - API response
   */
  signup: async (userData) => {
    try {
      // Handle potential field name variations (phoneNumber vs contactNo)
      const contactNo = userData.contactNo || userData.phoneNumber;
      
      // Enhanced debugging for contactNo field
      console.log("=== AUTH API SIGNUP DEBUG ===");
      console.log("Raw userData received:", userData);
      console.log("userData.contactNo:", userData.contactNo);
      console.log("userData.phoneNumber:", userData.phoneNumber);
      console.log("Resolved contactNo value:", contactNo);
      
      // Validate required fields before making the request
      if (!contactNo) {
        console.error('Missing required field: contactNo/phoneNumber', userData);
        return {
          success: false,
          data: null,
          message: 'Contact number is required'
        };
      }
      
      if (!userData.otp) {
        console.error('Missing required field: otp', userData);
        return {
          success: false,
          data: null,
          message: 'OTP is required'
        };
      }
      
      // Validate the role field is present (required by backend)
      if (!userData.role) {
        console.error('Missing required field: role', userData);
        return {
          success: false,
          data: null,
          message: 'Role is required'
        };
      }
      
      // Log the request payload for debugging
      console.log('Signup request payload preparing with:', userData);
      
      // Final payload with normalized field names
      const payload = {
        contactNo: contactNo,
        otp: userData.otp,
        role: userData.role, // Ensure role is included (required by backend)
        name: userData.name || '',
        email: userData.email || '',
        preferredFlatType: userData.preferredFlatType || '',
        minBudget: userData.minBudget || 0,
        maxBudget: userData.maxBudget || 0
      };
      
      console.log('Final signup request payload:', payload);
      
      const response = await api.post('/api/auth/signup', payload);
      
      console.log("Raw signup response:", response);
      
      if (!response) {
        return {
          success: false,
          data: null,
          message: 'Invalid server response'
        };
      }
      
      // Process response based on format
      if (typeof response === 'object') {
        // If response has nested data with AuthResponse
        if (response.data && typeof response.data === 'object') {
          return {
            success: true,
            data: response.data,
            message: response.message || "User registered successfully"
          };
        }
        
        // If response is already the processed AuthResponse
        if (response.jwt) {
          return {
            success: true,
            data: response,
            message: "User registered successfully"
          };
        }
        
        // If we still have ApiResponse wrapper
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            message: response.message || "User registered successfully"
          };
        }
      }
      
      // If we get here, the response format is unexpected
      console.warn('Unexpected response format from signup endpoint:', response);
      return {
        success: true,
        data: response,
        message: "User registered successfully"
      };
      
    } catch (error) {
      console.error('Error during signup:', error);
      
      // Enhanced error handling for validation errors
      if (error.response && error.response.data) {
        console.log('Signup error details:', error.response.data);
        
        // Handle validation errors from backend
        if (error.response.status === 400) {
          let errorMessage = 'Registration failed: ';
          
          // Extract detailed validation errors if available
          if (error.response.data.message) {
            errorMessage += error.response.data.message;
          } else if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
            errorMessage += error.response.data.errors.map(e => e.defaultMessage || e.message).join(', ');
          } else if (typeof error.response.data === 'string') {
            errorMessage += error.response.data;
          } else {
            errorMessage += 'Invalid data provided';
          }
          
          return {
            success: false,
            data: null,
            message: errorMessage,
            validationErrors: error.response.data.errors
          };
        }
      }
      
      return {
        success: false,
        data: null,
        message: error.message || 'Registration failed'
      };
    }
  },
  
  /**
   * Sign in an existing user
   * @param {string} contactNo - The user's phone number
   * @param {string} otp - The verified OTP
   * @returns {Promise} - API response with JWT token
   */
  signin: async (contactNo, otp) => {
    try {
      const response = await api.post('/api/auth/signin', { contactNo, otp });
      
      console.log("Raw signin response:", response);
      
      if (!response) {
        return {
          success: false,
          data: null,
          message: 'Invalid server response'
        };
      }
      
      // Process response based on format
      if (typeof response === 'object') {
        // Extract full AuthResponse data including role, not just the token
        // If response has JWT directly in top level (already extracted by interceptor)
        if (response.jwt) {
          // Return the complete object with role information
          return {
            success: true,
            data: {
              token: response.jwt,
              role: response.role, // Preserve the role
              userId: response.userId
            },
            message: response.message || "User authenticated successfully"
          };
        }
        
        // If response has nested data with AuthResponse structure
        if (response.data && typeof response.data === 'object') {
          // If data has JWT and role fields
          if (response.data.jwt) {
            return {
              success: true,
              data: {
                token: response.data.jwt,
                role: response.data.role, // Preserve the role
                userId: response.data.userId
              },
              message: response.message || response.data.message || "User authenticated successfully"
            };
          }
        }
        
        // If we still have ApiResponse wrapper
        if (response.success && response.data) {
          // Process different possible data structures
          if (typeof response.data === 'object' && response.data.jwt) {
            return {
              success: true,
              data: {
                token: response.data.jwt,
                role: response.data.role, // Preserve the role
                userId: response.data.userId
              },
              message: response.message || response.data.message || "User authenticated successfully"
            };
          } else if (typeof response.data === 'string') {
            // If for some reason we only got a token string
            return {
              success: true,
              data: {
                token: response.data,
                role: 'USER' // Default to USER if we can't find role
              },
              message: response.message || "User authenticated successfully"
            };
          }
        }
      }
      
      // If we get here, the response format is unexpected
      console.warn('Unexpected response format from signin endpoint:', response);
      return {
        success: false,
        data: null,
        message: 'Unexpected response format from server'
      };
      
    } catch (error) {
      console.error('Error during signin:', error);
      console.log('Error response data:', error.response?.data);
      
      // Enhanced error handling for deactivated accounts
      if (error.response) {
        // Log the entire error response for debugging
        console.log('Full error response:', error.response);
        
        // Check different parts of the error response structure
        const errorData = error.response.data;
        
        // Log the error data for debugging
        console.log('Error data:', errorData);
        
        // Case 1: Standard Spring Boot error response
        if (errorData && typeof errorData === 'object') {
          // If the message directly mentions deactivation
          if (errorData.message && errorData.message.includes('deactivated')) {
            return {
              success: false,
              data: null,
              message: errorData.message,
              code: 'ACCOUNT_DEACTIVATED'
            };
          }
          
          // If we have a nested error structure
          if (errorData.error && errorData.error.includes('deactivated')) {
            return {
              success: false,
              data: null,
              message: errorData.error,
              code: 'ACCOUNT_DEACTIVATED'
            };
          }
          
          // Check for our API custom response format
          if (errorData.data && errorData.data.message && errorData.data.message.includes('deactivated')) {
            return {
              success: false,
              data: null,
              message: errorData.data.message,
              code: 'ACCOUNT_DEACTIVATED'
            };
          }
        }
        
        // Case 2: Plain string error message
        if (typeof errorData === 'string' && errorData.includes('deactivated')) {
          return {
            success: false,
            data: null,
            message: errorData,
            code: 'ACCOUNT_DEACTIVATED'
          };
        }
        
        // If we have an error status in the 401-403 range, it might be a deactivation
        if (error.response.status === 401 || error.response.status === 403) {
          // Check if any part of the error message contains 'deactivated'
          const errorText = JSON.stringify(errorData);
          if (errorText.includes('deactivated')) {
            return {
              success: false,
              data: null,
              message: 'Your account has been deactivated. Please contact administrator.',
              code: 'ACCOUNT_DEACTIVATED'
            };
          }
        }
        
        // If we have any error message, return it
        if (errorData && errorData.message) {
          return {
            success: false,
            data: null,
            message: errorData.message,
            code: errorData.message.includes('deactivated') ? 'ACCOUNT_DEACTIVATED' : 'AUTH_ERROR'
          };
        }
      }
      
      // Default error response
      return {
        success: false,
        data: null,
        message: error.message || 'Authentication failed'
      };
    }
  },
  
  /**
   * Get the current user's profile
   * @returns {Promise} - API response with user profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get('/api/users/profile');
      console.log("Profile response:", response);
      
      if (!response) {
        return {
          success: false,
          data: null,
          message: 'Invalid server response'
        };
      }
      
      // Process response based on format
      if (typeof response === 'object') {
        // If response has nested data
        if (response.data && typeof response.data === 'object') {
          return {
            success: true,
            data: response.data,
            message: "Profile fetched successfully"
          };
        }
        
        // If response is already the processed data
        if (response.id || response.userId) {
          return {
            success: true,
            data: response,
            message: "Profile fetched successfully"
          };
        }
        
        // If we still have ApiResponse wrapper
        if (response.success && response.data) {
          return {
            success: true,
            data: response.data,
            message: response.message || "Profile fetched successfully"
          };
        }
      }
      
      // If we get here, the response format is unexpected
      console.warn('Unexpected response format from profile endpoint:', response);
      return {
        success: false,
        data: null,
        message: 'Invalid profile response'
      };
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to fetch profile'
      };
    }
  },
  
  // Update user profile - redirected to userApi
  updateProfile: (profileData) => {
    console.warn('authApi.updateProfile is deprecated. Use userApi.updateProfile instead.');
    return api.put('/api/users/profile', profileData);
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

export default authApi; 