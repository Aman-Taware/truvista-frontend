import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authApi from '../api/authApi';
import notificationService from '../utils/notificationService';

// Create Authentication Context
export const AuthContext = createContext(null);

// Global auth state flags available outside of React component tree
let isAuthenticated = false;
let isAuthInitialized = false;
let isRefreshingToken = false;
// Add a flag to track if this is the first authentication attempt
let isFirstAuthAttempt = true;

// Export function to check auth state from anywhere in the app
window.isUserLoggedOut = () => !isAuthenticated;

// The AuthProvider component
export const AuthProvider = ({ children }) => {
  // State for user authentication
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  
  // References to track token refresh and initialization
  const refreshTokenPromiseRef = useRef(null);
  const initializingRef = useRef(false);
  const logoutInProgressRef = useRef(false);
  const profileFetchingRef = useRef(false);

  /**
   * Handle session expiration by triggering logout
   * IMPORTANT: Define this function early as it's used by other functions
   */
  const handleSessionExpired = useCallback(() => {
    console.log('Session expired, logging out user');
    
    // Only show the notification if this isn't the first auth attempt
    // This prevents showing "session expired" for first-time visitors
    if (!isFirstAuthAttempt) {
      notificationService.showWarning('Your session has expired. Please log in again.');
    } else {
      console.log('First auth attempt - not showing session expired notification');
    }
    
    // We'll define logout later, so we need to use a function reference that will resolve later
    logout(true);
  }, [/* logout will be defined later, creating a circular reference */]);

  /**
   * Handle logout flow
   */
  const logout = useCallback(async (forced = false) => {
    // Prevent duplicate logout calls
    if (logoutInProgressRef.current) {
      console.log('Logout already in progress');
      return;
    }
    
    logoutInProgressRef.current = true;
    console.log(`Logging out user (forced=${forced})`);
    
    try {
      setLoading(true);
      
      // Update global auth state immediately
      isAuthenticated = false;
      
      // Only call API if this is an intentional logout (not a forced one due to token issues)
      if (!forced) {
        await authApi.logout();
      }
      
      // Reset auth state
            setUser(null);
      setSessionValid(false);
      
      // Notify app of logout
      window.dispatchEvent(new CustomEvent('auth:userLoggedOut'));
      
      console.log('Logout completed successfully');
    } catch (error) {
      console.error('Logout error:', error.message);
      // Still reset state even if API call fails
          setUser(null);
      setSessionValid(false);
      } finally {
        setLoading(false);
      logoutInProgressRef.current = false;
      }
  }, []);
  
  // Correctly set handleSessionExpired's dependency on logout
  // This fixes the circular reference
  useEffect(() => {
    // Update handleSessionExpired to have the latest version of logout
    handleSessionExpired.current = () => {
      console.log('Session expired, logging out user');
      
      // Only show the notification if this isn't the first auth attempt
      if (!isFirstAuthAttempt) {
        notificationService.showWarning('Your session has expired. Please log in again.');
      } else {
        console.log('First auth attempt - not showing session expired notification');
      }
      
      logout(true);
    };
  }, [logout]);

  /**
   * Initialize auth state by checking for existing session
   */
  const initializeAuth = useCallback(async () => {
    if (initializingRef.current) {
      console.log('Auth initialization already in progress, skipping duplicate call');
      return;
    }

    initializingRef.current = true;
    console.log('Initializing authentication state...');
    
    try {
      setLoading(true);
      // Check if we have a valid session by fetching the user profile
      await validateSession();
      console.log('Authentication initialized successfully');
    } catch (error) {
      console.error('Auth initialization failed:', error.message);
      // Reset auth state in case of error
      setUser(null);
      setSessionValid(false);
      isAuthenticated = false;
    } finally {
      setLoading(false);
      setInitialized(true);
      isAuthInitialized = true;
      initializingRef.current = false;
    }
  }, []);

  /**
   * Validate user session by trying to get user profile
   */
  const validateSession = useCallback(async () => {
    try {
      // If we already know the user is logged out, don't try to validate
      if (window.isUserLoggedOut()) {
        console.log('Session validation skipped - user is known to be logged out');
        setUser(null);
        setSessionValid(false);
        return false;
      }

      // Check if we are in the middle of logging out
      if (logoutInProgressRef.current) {
        console.log('Session validation skipped - logout in progress');
        return false;
      }

      // Try to get user profile
      const userData = await getProfile();
      if (userData) {
        console.log('Session validated successfully');
        setUser(userData);
        setSessionValid(true);
        isAuthenticated = true;
        isFirstAuthAttempt = false; // Mark that we've successfully authenticated once
        return true;
      } else {
        console.log('Session validation failed - no user data');
        setUser(null);
        setSessionValid(false);
        isAuthenticated = false;
        return false;
      }
    } catch (error) {
      console.error('Session validation error:', error.message);
      setUser(null);
      setSessionValid(false);
      isAuthenticated = false;
      return false;
    }
  }, []);

  /**
   * Get user profile with concurrent request protection
   */
  const getProfile = useCallback(async () => {
    // Skip if already fetching profile to prevent duplicate requests
    if (profileFetchingRef.current) {
      console.log('Profile fetch already in progress, skipping duplicate call');
      return null;
    }

    profileFetchingRef.current = true;
    
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      console.log(`Fetching user profile (t=${timestamp})`);
      
      // If the user is known to be logged out, skip the API call
      if (window.isUserLoggedOut()) {
        console.log('Profile fetch skipped - user is logged out');
        return null;
      }
      
      const profile = await authApi.getProfile();
      console.log('Profile fetched successfully:', profile);
      isFirstAuthAttempt = false; // Mark that we've had a successful auth
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        // Special handling for first-time visitors - don't try to refresh token
        if (isFirstAuthAttempt) {
          console.log('First-time visitor detected - skipping token refresh');
          // This is the expected flow for new sessions
          return null;
        }
        
        // Non-first time visitor, try to refresh the token
        try {
          console.log('Attempting to refresh token before giving up on profile fetch');
          await refreshAuthToken();
          
          // Try profile fetch again after token refresh
          const profile = await authApi.getProfile();
          console.log('Profile fetched successfully after token refresh');
          return profile;
        } catch (refreshError) {
          console.error('Token refresh failed during profile fetch:', refreshError.message);
          
          // Only proceed with session expired if not first auth attempt
          if (!isFirstAuthAttempt) {
            if (handleSessionExpired.current) {
              handleSessionExpired.current();
            } else {
              // Fallback if the current function isn't available
              console.log('Session expired, logging out user');
              logout(true);
            }
          } else {
            console.log('First auth attempt failed - this is normal for new visitors');
          }
          return null;
        }
      }
      
      return null;
    } finally {
      profileFetchingRef.current = false;
    }
  }, [logout]);

  /**
   * Refresh authentication token with concurrency protection
   */
  const refreshAuthToken = useCallback(async (options = {}) => {
    const { retry = 0, maxRetries = 2 } = options;
    
    // If a token refresh is already in progress, return the existing promise
    if (refreshTokenPromiseRef.current) {
      console.log('Using existing token refresh promise');
      return refreshTokenPromiseRef.current;
    }
    
    // Check if user is already logged out
    if (window.isUserLoggedOut()) {
      console.log('Token refresh skipped - user is known to be logged out');
      return Promise.reject(new Error('User is logged out'));
    }
    
    console.log(`Starting token refresh (attempt ${retry + 1} of ${maxRetries + 1})`);
    isRefreshingToken = true;
    
    // Create a new promise for the token refresh
    refreshTokenPromiseRef.current = authApi.refreshToken()
      .then(response => {
        console.log('Token refreshed successfully');
        // Reset auth state
        if (typeof api?.resetLoggedOutState === 'function') {
          api.resetLoggedOutState();
        }
        isAuthenticated = true;
        isFirstAuthAttempt = false; // We've successfully refreshed a token
        return response;
      })
      .catch(error => {
        console.error('Token refresh failed:', error.message);
        
        // Try again with exponential backoff if we haven't exceeded max retries
        if (retry < maxRetries) {
          const delay = Math.pow(2, retry) * 1000; // Exponential backoff: 1s, 2s, 4s, etc.
          console.log(`Retrying token refresh in ${delay}ms...`);
          
          return new Promise(resolve => {
            setTimeout(() => {
              // Clear the current promise so we can try again
              refreshTokenPromiseRef.current = null;
              isRefreshingToken = false;
              
              // Retry with incremented retry count
              resolve(refreshAuthToken({ retry: retry + 1, maxRetries }));
            }, delay);
          });
        }
        
        // Handle "Refresh token not found" errors after max retries
        if (error.response?.status === 401) {
          // Only show session expired for non-first auth attempts
          if (!isFirstAuthAttempt) {
            if (handleSessionExpired.current) {
              handleSessionExpired.current();
            } else {
              // Fallback if the current function isn't available
              console.log('Session expired, logging out user');
              logout(true);
            }
      } else {
            console.log('First auth attempt token refresh failed - expected for new visitors');
          }
        }
        
        throw error;
      })
      .finally(() => {
        // Don't clear if we're in a retry sequence
        if (retry >= maxRetries) {
          // Clear the promise reference when done
          refreshTokenPromiseRef.current = null;
          isRefreshingToken = false;
        }
      });
    
    return refreshTokenPromiseRef.current;
  }, [logout]);

  /**
   * Handle login flow
   */
  const login = useCallback(async (contactNo, otp) => {
    try {
      setLoading(true);
      console.log('Processing login for:', contactNo);
      
      // Sign in user with OTP
      const authData = await authApi.signin(contactNo, otp);
      
      // Fetch user profile after login
      const profile = await authApi.getProfile();
      console.log('User profile fetched after login:', profile);
      
      // Update authentication state
      setUser(profile);
      setSessionValid(true);
      isAuthenticated = true;
      isFirstAuthAttempt = false; // We've successfully logged in
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message);
      notificationService.showError(`Login failed: ${error.message}`);
      
      return { 
        success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle signup flow
   */
  const signup = useCallback(async (userData) => {
    try {
      setLoading(true);
      
      // Verify OTP first
      await authApi.verifyOtp(userData.contactNo, userData.otp);
      
      // Once OTP is verified, handle actual signup with API
      // Implementation depends on your API structure
      // This might not be exactly how your backend handles signup
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error.message);
      notificationService.showError(`Signup failed: ${error.message}`);
      
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register a new user with the API
   * This is called by AuthModal.jsx during registration flow
   */
  const registerUser = useCallback(async (userData) => {
    try {
      setLoading(true);
      console.log('Registering new user with contact:', userData.phoneNumber || userData.contactNo);
      
      // Use the signup endpoint to register the user
      const response = await authApi.signup(userData);
      
      // Update auth state with the new user
      if (response && response.userId) {
        try {
          // After signup, attempt to fetch the profile to update the state
          const profile = await authApi.getProfile();
          if (profile) {
            setUser(profile);
            setSessionValid(true);
            isAuthenticated = true;
            isFirstAuthAttempt = false;
          } else {
            console.warn('Registration successful but unable to fetch user profile');
          }
        } catch (profileError) {
          // Handle case where profile fetch fails after successful registration
          console.error('Failed to fetch profile after registration:', profileError);
          // We can still consider the registration a success even if we couldn't fetch the profile
        }
      }
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error.message);
      
      // Provide a more user-friendly error message
      let errorMessage = error.message || 'Registration failed. Please try again.';
      
      // Format validation errors more elegantly
      if (errorMessage.includes('Validation failed:')) {
        errorMessage = errorMessage.replace('Validation failed:', 'Please fix the following:');
      }
      
      return { 
        success: false, 
        message: errorMessage 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle user profile updates
   */
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      setLoading(true);
      const updatedProfile = await authApi.updateProfile(profileData);
      
      // Update user state with new profile data
      setUser(current => ({
        ...current,
        ...updatedProfile
      }));
      
      notificationService.showSuccess('Profile updated successfully');
      return { success: true, data: updatedProfile };
    } catch (error) {
      console.error('Profile update error:', error.message);
      notificationService.showError(`Failed to update profile: ${error.message}`);
      
      return { 
        success: false, 
        message: error.message || 'Profile update failed' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request OTP for authentication
   */
  const requestOtp = useCallback(async (contactNo) => {
    try {
      setLoading(true);
      
      // Use the sendOtp method from authApi
      await authApi.sendOtp(contactNo);
      
      return { 
        success: true, 
        message: 'OTP sent successfully to your phone number' 
      };
    } catch (error) {
      console.error('Request OTP error:', error.message);
      
          return { 
            success: false, 
        message: error.message || 'Failed to send OTP. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Verify user OTP during authentication flow
   */
  const verifyUserOtp = useCallback(async (contactNo, otp) => {
    try {
      setLoading(true);
      
      // Use the verifyOtp method from authApi
      const response = await authApi.verifyOtp(contactNo, otp);
      
      // The backend returns "SIGNUP" or "LOGIN" based on whether user exists
      return { 
        success: true, 
        data: response === 'SIGNUP' ? 'SIGNUP' : 'LOGIN',
        message: 'OTP verified successfully' 
      };
    } catch (error) {
      console.error('Verify OTP error:', error.message);
      
          return { 
            success: false, 
        message: error.message || 'Failed to verify OTP. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login with verified OTP
   */
  const loginUser = useCallback(async (contactNo, otp) => {
    try {
      setLoading(true);
      
      // Use the signin method to complete login after OTP verification
      await authApi.signin(contactNo, otp);
      
      // Get user profile after login
      const profile = await authApi.getProfile();
      
      // Update auth state
      setUser(profile);
      setSessionValid(true);
      isAuthenticated = true;
      isFirstAuthAttempt = false;
      
      return { success: true };
    } catch (error) {
      console.error('Login user error:', error.message);
      
          return { 
            success: false, 
        message: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize authentication on component mount
  useEffect(() => {
    initializeAuth();
    
    // Clean up function to reset first auth attempt flag when component unmounts
    return () => {
      isFirstAuthAttempt = true;
    };
  }, [initializeAuth]);

  // Handle session expired events
  useEffect(() => {
    const handleSessionExpiredEvent = (event) => {
      console.log('Session expired event received:', event.detail);
      
      // Set first auth attempt to false since we received an explicit expiration event
      isFirstAuthAttempt = false;
      
      if (handleSessionExpired.current) {
        handleSessionExpired.current();
      } else {
        // Fallback
        logout(true);
      }
    };

    const handleLogoutEvent = (event) => {
      console.log('Logout event received:', event.detail);
      logout(event.detail?.forced || false);
    };

    // Listen for session expiration events
    window.addEventListener('auth:sessionExpired', handleSessionExpiredEvent);
    window.addEventListener('auth:logout', handleLogoutEvent);

    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpiredEvent);
      window.removeEventListener('auth:logout', handleLogoutEvent);
    };
  }, [logout]);

  // Create a ref for the handleSessionExpired function to avoid circular dependencies
  const handleSessionExpiredRef = useRef();
  handleSessionExpiredRef.current = handleSessionExpired;

  // Auth context value
  const contextValue = {
    user,
    loading,
    initialized,
    isAuthenticated: !!user,
    sessionValid,
    refreshToken: refreshAuthToken,
    logout,
    login,
    signup,
    registerUser,
    requestOtp,
    verifyUserOtp,
    loginUser,
    isAdmin: () => user?.role === 'ADMIN',
    isExecutive: () => user?.role === 'EXECUTIVE',
    handleSessionExpired: () => handleSessionExpiredRef.current(),
    updateProfile: updateUserProfile,
    getProfile
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// For Fast Refresh compatibility, export AuthContext as the default
export default AuthContext; 