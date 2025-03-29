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
      if (error.response?.status === 400 && error.response?.data?.message) {
        if (error.response.data.message.includes("expired")) {
          throw new Error("OTP has expired. Please request a new one.");
        } else if (error.response.data.message.includes("invalid")) {
          throw new Error("Invalid OTP. Please check and try again.");
        }
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
};

export default authApi; 