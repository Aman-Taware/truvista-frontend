import axios from "axios";
import { API_URL } from "../config/constants";

// Create a dedicated instance for auth requests to avoid circular dependencies with interceptors
const authApiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a logging interceptor for debugging auth issues
authApiClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Auth API Request: ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("Auth API Request Error:", error);
    return Promise.reject(error);
  }
);

authApiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`Auth API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error("Auth API Response Error:", error.message, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// Helper function to extract response data with safety checks
const extractData = (response) => {
  // Handle direct response object
  if (response && response.data !== undefined) {
    if (response.data && typeof response.data === 'object' && response.data.data !== undefined) {
      // Handle nested data structure: { data: { ... } }
      return response.data.data;
    }
    // Handle flat response: { ... }
    return response.data;
  }
  
  console.warn("Unexpected response format:", response);
  return null;
};

/**
 * Authentication API methods
 */
const authApi = {
  /**
   * Send OTP to phone number
   * @param {string} contactNo - Phone number
   * @returns {Promise<{message: string}>} - Response message
   */
  async sendOtp(contactNo) {
    try {
      console.log("Sending OTP to:", contactNo);
      // The endpoint should be /api/auth/start as defined in the backend
      const response = await authApiClient.post("/api/auth/start", { contactNo });
      console.log("OTP sent successfully");
      return extractData(response);
    } catch (error) {
      console.error("Send OTP Error:", error.message, error.response?.data);
      throw error;
    }
  },
  
  /**
   * Verify OTP and sign in
   * @param {string} contactNo - Phone number
   * @param {string} otp - One-time password
   * @returns {Promise<{user: object, token: string}>} - User data and tokens
   */
  async verifyOtp(contactNo, otp) {
    try {
      const response = await authApiClient.post("/api/auth/verify-otp", { contactNo, otp });
      return extractData(response);
    } catch (error) {
      // Enhance error message for invalid OTPs
      if (error.response?.status === 400) {
        // Check for specific API response patterns
        if (error.response?.data?.message) {
          const errorMessage = error.response.data.message;
          
          if (errorMessage.includes("expired")) {
            throw new Error("OTP has expired. Please request a new one.");
          } else if (errorMessage.includes("invalid") || errorMessage.includes("Invalid")) {
            throw new Error("The OTP you entered is incorrect. Please check and try again.");
          } else if (errorMessage.includes("attempts exceeded")) {
            throw new Error("Too many incorrect attempts. Please request a new OTP.");
          } else {
            // Use the server message if available
            throw new Error(errorMessage);
          }
        } else {
          // Generic 400 error
          throw new Error("The OTP you entered is incorrect. Please check and try again.");
        }
      } else if (error.response?.status === 401) {
        throw new Error("Your session has expired. Please request a new OTP.");
      } else if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment before trying again.");
      } else if (!error.response && error.message.includes("Network Error")) {
        throw new Error("Network connection issue. Please check your internet connection and try again.");
      }
      
      console.error("Verify OTP Error:", error.message, error.response?.data);
      throw error;
    }
  },

  /**
   * Sign in with phone and OTP
   * @param {string} contactNo - Phone number
   * @param {string} otp - One-time password
   * @returns {Promise<{user: object, token: string}>} - User data and tokens
   */
  async signin(contactNo, otp) {
    try {
      const response = await authApiClient.post("/api/auth/signin", { contactNo, otp });
      return extractData(response);
    } catch (error) {
      // Enhance error messages for specific cases
      if (error.response?.status === 400 && error.response?.data?.message) {
        if (error.response.data.message.includes("OTP")) {
          throw new Error("Invalid OTP provided. Please try again.");
        }
      }
      console.error("Signin Error:", error.message, error.response?.data);
      throw error;
    }
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data including phoneNumber, otp, name, email, etc.
   * @returns {Promise<{userId: number, jwt: string}>} - New user data and auth token
   */
  async signup(userData) {
    try {
      // Map frontend field names to backend expected field names
      const backendData = {
        name: userData.name,
        email: userData.email,
        contactNo: userData.phoneNumber || userData.contactNo, // Handle both field name formats
        otp: userData.otp,
        role: userData.role || 'USER', // Default to USER role if not specified
        preferredFlatType: userData.preferredFlatType,
        minBudget: userData.minBudget || 0,
        maxBudget: userData.maxBudget || 0
      };
      
      // Validate required fields before sending
      const requiredFields = ['name', 'email', 'contactNo', 'otp', 'role'];
      const missingFields = requiredFields.filter(field => !backendData[field]);
      
      if (missingFields.length > 0) {
        console.error("Missing required fields for signup:", missingFields);
        throw new Error(`Missing required fields for registration: ${missingFields.join(', ')}`);
      }
      
      console.log("Registering new user with mapped data:", {
        ...backendData,
        otp: backendData.otp ? '******' : undefined, // Log sanitized version
        contactNo: backendData.contactNo ? '******' + backendData.contactNo.slice(-4) : undefined // Hide most of the contact number
      });
      
      const response = await authApiClient.post("/api/auth/signup", backendData);
      console.log("User registered successfully");
      return extractData(response);
    } catch (error) {
      // Enhanced error handling with specific error messages for each case
      if (error.response?.status === 400) {
        const responseData = error.response.data;
        console.error("Signup validation error:", responseData);
        
        // Check for different types of validation errors
        if (responseData?.errors && responseData.errors.length > 0) {
          // Extract specific field errors
          const fieldErrors = responseData.errors.map(err => err.defaultMessage || err).join(', ');
          throw new Error(`Validation failed: ${fieldErrors}`);
        } else if (responseData?.message?.includes("already exists")) {
          throw new Error("A user with this phone number or email already exists.");
        } else if (responseData?.message?.includes("OTP")) {
          throw new Error("Invalid or expired OTP. Please request a new one.");
        } else if (responseData?.message) {
          throw new Error(responseData.message);
        }
      }
      
      console.error("Signup Error:", error.message, error.response?.data);
      throw error;
    }
  },
  
  /**
   * Refresh authentication token
   * @returns {Promise<{token: string}>} - New access token
   */
  async refreshToken() {
    try {
      console.log("Attempting to refresh token...");
      
      const headers = {
        "X-Requested-With": "XMLHttpRequest",
      };
      
      // Add development headers if in development mode
      if (process.env.NODE_ENV === 'development') {
        // Try to get user ID from localStorage for development testing
        const userData = localStorage.getItem('user_data');
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            if (parsedData.id) {
              console.log("Adding development user ID header for testing");
              headers["X-Dev-User-Id"] = parsedData.id.toString();
              headers["X-Debug-Contact"] = parsedData.contactNo || '';
            }
          } catch (e) {
            console.error("Error parsing user data for development headers:", e);
          }
        }
      }
      
      // Use direct axios here to avoid interceptors that might cause loops
      const response = await authApiClient.post(
        "/api/auth/refresh",
        {},
        {
          withCredentials: true,
          headers
        }
      );
      
      const data = extractData(response);
      console.log("Token refreshed successfully");
      
      // Reset any "logged out" state in the main API client
      if (window.resetLoggedOutState) {
        window.resetLoggedOutState();
      }
      
      return data;
    } catch (error) {
      // Log detailed error information
      console.error("Token refresh failed:", error.message);
      console.error("Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      
      // Handle "Refresh token not found" errors
      if (error.response?.status === 401) {
        console.warn("Authentication required: User needs to log in again");
        // Dispatch a custom event so AuthContext can handle the session expiration
        window.dispatchEvent(new CustomEvent('auth:sessionExpired', { 
          detail: { reason: 'refresh_token_missing' } 
        }));
      }
      
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {Promise<{message: string}>} - Logout confirmation
   */
  async logout() {
    try {
      const response = await authApiClient.post("/api/auth/logout");
      console.log("Logged out successfully from server");
      return extractData(response);
    } catch (error) {
      console.error("Logout Error:", error.message);
      console.log("Proceeding with client-side logout regardless of server response");
      // Dispatch event for client-side logout even if server call fails
      window.dispatchEvent(new CustomEvent('auth:logout', { detail: { forced: true } }));
      // We don't throw here because we want client logout to happen regardless
      return { message: "Logged out on client" };
    }
  },

  /**
   * Get current user profile
   * @returns {Promise<object>} - User profile data
   */
  async getProfile() {
    try {
      console.log("Attempting to get user profile");
      const response = await authApiClient.get("/api/users/profile");
      const profileData = extractData(response);
      console.log("Profile data retrieved:", profileData ? "Success" : "No data returned");
      return profileData;
    } catch (error) {
      // Special handling for authentication errors
      if (error.response?.status === 401) {
        console.warn("User must be logged in to get profile");
        // Check if user is actually logged out
        const isUserLoggedOut = window.isUserLoggedOut?.() || false;
        if (isUserLoggedOut) {
          console.log("User is marked as logged out - this is expected for non-authenticated users");
          throw new Error("User is logged out");
        } else {
          console.warn("User is not marked as logged out but got 401 - potential token issue");
        }
      }
      console.error("Get Profile Error:", error.message, error.response?.data);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {object} profileData - Updated profile information
   * @returns {Promise<object>} - Updated user profile
   */
  async updateProfile(profileData) {
    try {
      const response = await authApiClient.put("/api/users/profile", profileData);
      return extractData(response);
    } catch (error) {
      console.error("Update Profile Error:", error.message, error.response?.data);
      throw error;
    }
  },
  
  /**
   * Check if access token is valid
   * @returns {Promise<boolean>} - True if token is valid
   */
  async validateToken() {
    try {
      const response = await authApiClient.get("/api/auth/validate");
      return extractData(response);
    } catch (error) {
      console.error("Token Validation Error:", error.message);
      return false;
    }
  },

  /**
   * Ensure user is authenticated by checking and refreshing tokens if needed
   * @returns {Promise<boolean>} - True if authentication could be established/maintained
   */
  async ensureAuthentication() {
    console.log("Checking authentication status");
    
    try {
      // Reset any "logged out" state to ensure we can try authentication
      if (window.resetLoggedOutState) {
        window.resetLoggedOutState();
      }
      
      // Attempt token refresh first
      try {
        await this.refreshToken();
        console.log("Token refreshed successfully during authentication check");
        return true;
      } catch (refreshError) {
        console.log("Token refresh failed during authentication check:", refreshError.message);
        
        // Even if refresh fails, still try to get profile as a last resort
        // This handles edge cases where the token is still valid
        try {
          const profile = await this.getProfile();
          if (profile) {
            console.log("Profile retrieved successfully despite refresh failure");
            return true;
          }
        } catch (profileError) {
          console.log("Profile fetch failed after refresh failure");
        }
      }
      
      // If we get here, authentication couldn't be restored
      return false;
    } catch (error) {
      console.error("Authentication check error:", error);
      return false;
    }
  }
};

export default authApi; 