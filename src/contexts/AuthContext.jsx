import React, { createContext, useState, useEffect } from 'react';
import authApi from '../api/authApi';

// Create the context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Create a simple notification helper
  const showNotification = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}]: ${message}`);
    // You can implement a custom notification system here if needed
    // For now, we'll just log to console to avoid Chakra UI dependency issues
  };
  
  // Check if user is logged in on component mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          try {
            // Try to parse the user data
            const parsedUserData = JSON.parse(userData);
            
            // Basic validation of the user data structure
            if (!parsedUserData.isAuthenticated || !parsedUserData.phone) {
              console.warn('Invalid user data format in localStorage');
              // Clear invalid data
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              setUser(null);
            } else {
              // Set user state with parsed data
              setUser(parsedUserData);
              
              // Optional: You could add a token validation check with the backend here
              // For example: await authApi.validateToken(token)
            }
          } catch (parseError) {
            console.error('Error parsing user data from localStorage:', parseError);
            // Clear invalid data
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            setUser(null);
          }
        } else {
          // If either token or userData is missing, clear both to maintain consistency
          if (token || userData) {
            console.warn('Inconsistent auth state: token or userData missing');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
          }
          setUser(null);
        }
      } catch (err) {
        console.error('Error checking auth state:', err);
        setError('Failed to restore session');
        // Clear potentially corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkLoggedIn();
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
        let role = 'USER'; // Default role
        let userId = null;
        
        // Handle various response structures we've seen in the system
        if (typeof response.data === 'string') {
          // If response.data is just the token string
          token = response.data;
        } else if (response.data.token) {
          // If response has data.token structure
          token = response.data.token;
          role = response.data.role || role;
          userId = response.data.userId;
        } else if (response.data.jwt) {
          // If response has data.jwt structure
          token = response.data.jwt;
          role = response.data.role || role;
          userId = response.data.userId;
        }
        
        // Verify we have a valid token before proceeding
        if (!token) {
          console.error("No valid token found in response:", response);
          setError("Authentication failed: Invalid token response");
          showNotification("Authentication failed: Invalid token response", "error");
          return { success: false, message: "Invalid token response" };
        }
        
        // Store the token with a consistent key
        localStorage.setItem('auth_token', token);
        
        // Create a consistent user data object
        const userData = {
          phone: phoneNumber,
          isAuthenticated: true,
          role: role,
          userId: userId
        };
        
        // Log the data being stored for debugging
        console.log("User data being stored:", userData);
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        
        showNotification("You have been successfully logged in", "success");
        
        return { success: true, data: userData };
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
        let role = 'USER'; // Default role for new registrations
        let userId = null;
        
        // Handle various response structures we've seen in the system
        if (typeof response.data === 'string') {
          // If response.data is just the token string
          token = response.data;
        } else if (response.data.token) {
          // If response has data.token structure
          token = response.data.token;
          role = response.data.role || role;
          userId = response.data.userId;
        } else if (response.data.jwt) {
          // If response has data.jwt structure
          token = response.data.jwt;
          role = response.data.role || role;
          userId = response.data.userId;
        }
        
        // Verify we have a valid token before proceeding
        if (!token) {
          console.error("No valid token found in registration response:", response);
          setError("Registration failed: Invalid token response");
          showNotification("Registration failed: Invalid token response", "error");
          return { success: false, message: "Invalid token response" };
        }
        
        // Store the token with a consistent key
        localStorage.setItem('auth_token', token);
        
        // Create a consistent user data object
        const userDataObj = {
          phone: userData.phoneNumber,
          name: userData.name,
          email: userData.email,
          isAuthenticated: true,
          role: role,
          userId: userId,
          preferredFlatType: userData.preferredFlatType,
          budgetRange: [userData.minBudget, userData.maxBudget]
        };
        
        // Store user data
        localStorage.setItem('user_data', JSON.stringify(userDataObj));
        
        // Update state
        setUser(userDataObj);
        
        showNotification("Your account has been created successfully", "success");
        
        return { success: true, data: userDataObj };
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
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    
    showNotification("You have been successfully logged out", "info");
    
    return { success: true };
  };
  
  // Context value
  const value = {
    user,
    setUser,
    loading,
    error,
    requestOtp,
    verifyUserOtp,
    loginUser,
    registerUser,
    logoutUser,
    isAuthenticated: !!user,
    isAdmin: !!user && (user.role?.toUpperCase() === 'ADMIN')
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 