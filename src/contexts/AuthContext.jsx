import React, { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';
import userApi from '../api/userApi';

// Create the context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Token management functions
  const storeAuthToken = (token) => {
    if (!token) return;
    
    // Store only the JWT token in localStorage
    localStorage.setItem('auth_token', token);
    
    // Set token expiration time (default to 24 hours if not in token)
    try {
      // Try to decode the JWT token to get expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp) {
        // Token already has expiration, use it
        const expiry = new Date(payload.exp * 1000).toISOString();
        localStorage.setItem('token_expiry', expiry);
      } else {
        // Set a default expiration of 24 hours
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 24);
        localStorage.setItem('token_expiry', expiry.toISOString());
      }
    } catch (e) {
      // If token parsing fails, set default expiration
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 24);
      localStorage.setItem('token_expiry', expiry.toISOString());
    }
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('token_expiry');
    
    // Check if token is expired
    if (token && expiry) {
      const isExpired = new Date() > new Date(expiry);
      if (isExpired) {
        clearAuthData();
        return null;
      }
    }
    
    return token;
  };

  const clearAuthData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user_data'); // Remove non-sensitive user data cache
  };

  // Create a simple notification helper
  const showNotification = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}]: ${message}`);
    // You can implement a custom notification system here if needed
    // For now, we'll just log to console to avoid Chakra UI dependency issues
  };
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = getAuthToken();
        
        if (token) {
          try {
            // Get fresh user data from API
            const response = await userApi.getProfile();
            
            if (response) {
              // Extract user data directly from response
              const userData = {
                id: response.id,
                name: response.name,
                email: response.email,
                contactNo: response.contactNo,
                role: response.role, // Keep this for role-based authorization
                preferredFlatType: response.preferredFlatType,
                minBudget: response.minBudget,
                maxBudget: response.maxBudget,
                isAuthenticated: true
              };
              
              // Update state with user profile data
              setUser(userData);
              
              // Store only non-sensitive data in localStorage for UI purposes
              const publicUserData = {
                id: response.id,
                name: response.name,
                email: response.email,
                contactNo: response.contactNo,
                // Excluded: role
                preferredFlatType: response.preferredFlatType,
                minBudget: response.minBudget,
                maxBudget: response.maxBudget,
                isAuthenticated: true
              };
              
              localStorage.setItem('user_data', JSON.stringify(publicUserData));
            } else {
              // API call failed, clear authentication
              clearAuthData();
              setUser(null);
            }
          } catch (parseError) {
            console.error('Error fetching user profile:', parseError);
            // Clear authentication data
            clearAuthData();
            setUser(null);
          }
        } else {
          // No valid token found
          clearAuthData();
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError('Failed to restore session');
        // Clear potentially corrupted data
        clearAuthData();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Function to request OTP
  const requestOtp = async (phoneNumber) => {
    try {
      setError(null);
      const response = await authApi.startAuth(phoneNumber);
      
      if (response.success) {
        showNotification("A verification code has been sent to your phone", "success");
        return response;
      } else {
        setError(response.message);
        showNotification(response.message || "Failed to send OTP", "error");
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || "Something went wrong";
      setError(errorMessage);
      showNotification(errorMessage, "error");
      return { success: false, message: errorMessage };
    }
  };
  
  // Function to verify OTP
  const verifyUserOtp = async (phoneNumber, otp) => {
    try {
      setError(null);
      const response = await authApi.verifyOtp(phoneNumber, otp);
      
      if (response.success) {
        // If this is a LOGIN response, we need to proceed to signin
        if (response.data === "LOGIN") {
          return { ...response, action: "LOGIN" };
        }
        
        // If this is a SIGNUP response, we need to proceed to registration
        if (response.data === "SIGNUP") {
          return { ...response, action: "SIGNUP" };
        }
        
        // Default case
        return response;
      } else {
        setError(response.message);
        showNotification(response.message || "Failed to verify OTP", "error");
        return response;
      }
    } catch (err) {
      const errorMessage = err.message || "Something went wrong";
      setError(errorMessage);
      showNotification(errorMessage, "error");
      return { success: false, message: errorMessage };
    }
  };
  
  // Function to sign in user
  const loginUser = async (phoneNumber, otp) => {
    try {
      setError(null);
      console.log("Attempting login with phone:", phoneNumber);
      const response = await authApi.signin(phoneNumber, otp);
      
      console.log("Login response:", response);
      
      if (response.success && response.data) {
        // Extract token with consistent handling of different response formats
        let token = null;
        
        // Handle various response structures we've seen in the system
        if (typeof response.data === 'string') {
          // If response.data is just the token string
          token = response.data;
        } else if (response.data.token) {
          // If response has data.token structure
          token = response.data.token;
        } else if (response.data.jwt) {
          // If response has data.jwt structure
          token = response.data.jwt;
        }
        
        // Verify we have a valid token before proceeding
        if (!token) {
          console.error("No valid token found in response:", response);
          setError("Authentication failed: Invalid token response");
          showNotification("Authentication failed: Invalid token response", "error");
          return { success: false, message: "Invalid token response" };
        }
        
        // Store only the token in localStorage
        storeAuthToken(token);
        
        // Get fresh user data from the API
        try {
          const userProfile = await userApi.getProfile();
          
          if (!userProfile) {
            throw new Error("Failed to fetch user profile");
          }
          
          // Create user data object from API response
          const userData = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            contactNo: userProfile.contactNo,
            role: userProfile.role,
            preferredFlatType: userProfile.preferredFlatType,
            minBudget: userProfile.minBudget,
            maxBudget: userProfile.maxBudget,
            isAuthenticated: true
          };
          
          // Update auth state with user data
          setUser(userData);
          
          // Store only non-sensitive user data for UI purposes
          const publicUserData = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            contactNo: userProfile.contactNo,
            // Exclude role and sensitive information
            preferredFlatType: userProfile.preferredFlatType,
            minBudget: userProfile.minBudget,
            maxBudget: userProfile.maxBudget,
            isAuthenticated: true
          };
          
          localStorage.setItem('user_data', JSON.stringify(publicUserData));
          
          showNotification("You have been successfully logged in", "success");
          return { success: true, data: userData };
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          clearAuthData();
          setError("Failed to load user profile");
          showNotification("Failed to load user profile", "error");
          return { success: false, message: "Failed to load user profile" };
        }
      } else {
        // Handle specific error codes
        if (response.code === 'ACCOUNT_DEACTIVATED') {
          const errorMessage = response.message || "Your account has been deactivated. Please contact administrator.";
          console.error("Account deactivated error:", errorMessage);
          setError(errorMessage);
          showNotification(errorMessage, "error");
          return { success: false, message: errorMessage, code: 'ACCOUNT_DEACTIVATED' };
        }
        
        console.error("Login failed:", response.message);
        setError(response.message);
        showNotification(response.message || "Failed to login", "error");
        return response;
      }
    } catch (err) {
      console.error("Login error:", err);
      
      // Additional check for deactivated account in the error object
      if (err.response?.data?.message?.includes('deactivated')) {
        const errorMessage = err.response.data.message;
        console.error("Account deactivated error from catch:", errorMessage);
        setError(errorMessage);
        showNotification(errorMessage, "error");
        return { success: false, message: errorMessage, code: 'ACCOUNT_DEACTIVATED' };
      }
      
      const errorMessage = err.message || "Something went wrong";
      setError(errorMessage);
      showNotification(errorMessage, "error");
      return { success: false, message: errorMessage };
    }
  };
  
  // Function to register user
  const registerUser = async (userData) => {
    try {
      setError(null);
      
      console.log("=== REGISTER USER DEBUG ===");
      console.log("Input userData:", userData);
      
      // Validate required fields before submission
      if (!userData.phoneNumber) {
        console.error("Missing phoneNumber in userData:", userData);
        const errorMessage = "Phone number is required";
        setError(errorMessage);
        showNotification(errorMessage, "error");
        return { success: false, message: errorMessage };
      }
      
      if (!userData.otp) {
        console.error("Missing OTP in userData:", userData);
        const errorMessage = "OTP is required";
        setError(errorMessage);
        showNotification(errorMessage, "error");
        return { success: false, message: errorMessage };
      }
      
      // Prepare the request payload with the correct field names
      const signupData = {
        name: userData.name || "",
        email: userData.email || "",
        contactNo: userData.phoneNumber, // Ensure this matches the backend field name
        otp: userData.otp,
        role: "USER", // Add the required role field - backend requires this!
        preferredFlatType: userData.preferredFlatType || "",
        minBudget: userData.minBudget || 0,
        maxBudget: userData.maxBudget || 0
      };
      
      // Enhanced debugging to identify the issue
      console.log("=== SIGNUP DATA DEBUG ===");
      console.log("Full signup payload:", signupData);
      console.log("phoneNumber from userData:", userData.phoneNumber);
      console.log("contactNo being sent:", signupData.contactNo);
      console.log("otp being sent:", signupData.otp);
      console.log("role being sent:", signupData.role);
      
      // Validate the contactNo field is actually set
      if (!signupData.contactNo) {
        console.error("CRITICAL ERROR: contactNo is not set in final payload");
        setError("Phone number is required for registration");
        showNotification("Phone number is required for registration", "error");
        return { success: false, message: "Phone number is required for registration" };
      }
      
      // Make the API call with validated data
      const response = await authApi.signup(signupData);
      
      console.log("Registration response:", response);
      
      if (response.success && response.data) {
        // Extract token with consistent handling of different response formats
        let token = null;
        
        // Handle various response structures we've seen in the system
        if (typeof response.data === 'string') {
          // If response.data is just the token string
          token = response.data;
        } else if (response.data.token) {
          // If response has data.token structure
          token = response.data.token;
        } else if (response.data.jwt) {
          // If response has data.jwt structure
          token = response.data.jwt;
        }
        
        // Verify we have a valid token before proceeding
        if (!token) {
          console.error("No valid token found in registration response:", response);
          setError("Registration failed: Invalid token response");
          showNotification("Registration failed: Invalid token response", "error");
          return { success: false, message: "Invalid token response" };
        }
        
        // Store only the token in localStorage
        storeAuthToken(token);
        
        // Get fresh user data from the API
        try {
          const userProfile = await userApi.getProfile();
          
          if (!userProfile) {
            throw new Error("Failed to fetch user profile after registration");
          }
          
          // Create user data object from API response
          const userDataObj = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            contactNo: userProfile.contactNo,
            role: userProfile.role,
            preferredFlatType: userProfile.preferredFlatType,
            minBudget: userProfile.minBudget,
            maxBudget: userProfile.maxBudget,
            isAuthenticated: true
          };
          
          // Update user state with data from API
          setUser(userDataObj);
          
          // Store only non-sensitive user data for UI purposes
          const publicUserData = {
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            contactNo: userProfile.contactNo,
            // Exclude role
            preferredFlatType: userProfile.preferredFlatType,
            minBudget: userProfile.minBudget,
            maxBudget: userProfile.maxBudget,
            isAuthenticated: true
          };
          
          localStorage.setItem('user_data', JSON.stringify(publicUserData));
          
          showNotification("Your account has been created successfully", "success");
          
          return { success: true, data: userDataObj };
        } catch (profileError) {
          console.error("Error fetching user profile after registration:", profileError);
          clearAuthData();
          setError("Failed to load user profile after registration");
          showNotification("Registration successful but failed to load profile", "warning");
          return { success: false, message: "Registration successful but failed to load profile" };
        }
      } else {
        const errorMessage = response.message || "Registration failed";
        setError(errorMessage);
        showNotification(errorMessage, "error");
        return { ...response, code: response.errorCode };
      }
    } catch (err) {
      console.error("Registration error details:", err);
      
      // Handle specific HTTP error codes and backend error messages
      if (err.response) {
        const { data, status } = err.response;
        
        // Handle specific error codes from our custom exception handlers
        if (data && data.errorCode) {
          let errorMessage = data.message || "Registration failed";
          
          if (data.errorCode === 'EMAIL_ALREADY_EXISTS') {
            errorMessage = "This email is already registered with another account.";
          } else if (data.errorCode === 'CONTACT_ALREADY_EXISTS') {
            errorMessage = "This phone number is already registered with another account.";
          }
          
          setError(errorMessage);
          showNotification(errorMessage, "error");
          return { 
            success: false, 
            message: errorMessage, 
            code: data.errorCode 
          };
        }
        
        // Handle other HTTP error statuses
        if (status === 409) { // Conflict status
          const errorMessage = "This email or phone number is already registered.";
          setError(errorMessage);
          showNotification(errorMessage, "error");
          return { 
            success: false, 
            message: errorMessage, 
            code: 'DUPLICATE_USER' 
          };
        } else if (status === 400) { // Bad request
          const errorMessage = data.message || "Invalid registration data";
          setError(errorMessage);
          showNotification(errorMessage, "error");
          return { 
            success: false, 
            message: errorMessage, 
            code: 'INVALID_DATA' 
          };
        }
      }
      
      // Generic error handling as fallback
      const errorMessage = err.message || "Something went wrong during registration";
      setError(errorMessage);
      showNotification(errorMessage, "error");
      return { success: false, message: errorMessage };
    }
  };
  
  // Function to log out user
  const logoutUser = () => {
    // Clear all auth data
    clearAuthData();
    
    // Reset user state
    setUser(null);
    
    showNotification("You have been successfully logged out", "info");
    
    return { success: true };
  };
  
  // Function to check if user is admin
  const isAdmin = () => {
    return !!user && user.role === 'ADMIN';
  };
  
  // Context value
  const value = {
    user,
    setUser,
    loading,
    error,
    getAuthToken, // Expose token getter for API calls
    requestOtp,
    verifyUserOtp,
    loginUser,
    registerUser,
    logoutUser,
    isAuthenticated: !!user,
    isAdmin: isAdmin, // Function for checking admin role
    // Legacy compatibility - to be removed after migration
    _isAdmin: !!user && user.role === 'ADMIN'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 