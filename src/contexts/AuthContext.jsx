import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authApi from '../api/authApi';
import api from '../api';
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
  const handleSessionExpiredRef = useRef(null);

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
    
    // Check if user is already logged out - but during startup, we should still try
    if (window.isUserLoggedOut() && !isFirstAuthAttempt) {
      console.log('Token refresh skipped - user is known to be logged out and not first attempt');
      return Promise.reject(new Error('User is logged out'));
    }
    
    console.log(`Starting token refresh (attempt ${retry + 1} of ${maxRetries + 1})`);
    isRefreshingToken = true;
    
    // Create a new promise for the token refresh
    refreshTokenPromiseRef.current = authApi.refreshToken()
      .then(response => {
        console.log('Token refreshed successfully');
        // Reset auth state
        if (typeof authApi?.resetLoggedOutState === 'function') {
          authApi.resetLoggedOutState();
        }
        if (typeof api.resetLoggedOutState === 'function') {
          api.resetLoggedOutState();
        }
        isAuthenticated = true;
        isFirstAuthAttempt = false; // We've successfully refreshed a token
        return response;
      })
      .catch(error => {
        console.log('Token refresh failed:', error.message);
        
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
        
        // For first attempt, quietly fail if no token
        if (isFirstAuthAttempt) {
          console.log('First auth attempt token refresh failed - expected for new visitors');
          // Don't set logged out state for first time visitors
          isFirstAuthAttempt = false;
        } else {
          // Handle "Refresh token not found" errors after max retries
          if (error.response?.status === 401) {
            if (handleSessionExpiredRef.current) {
              handleSessionExpiredRef.current();
            } else {
              // Fallback if the handler function isn't available
              console.log('Session expired, logging out user');
              logout(true);
            }
          }
        }
        
        throw error;
      })
      .finally(() => {
        // Always reset the promise reference and flag when complete
        refreshTokenPromiseRef.current = null;
        isRefreshingToken = false;
      });
    
    return refreshTokenPromiseRef.current;
  }, []);  // logout is intentionally not in the dependency array to avoid circular reference

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
      
      // If the user is known to be logged out, skip the API call - but not during first attempt
      if (window.isUserLoggedOut() && !isFirstAuthAttempt) {
        console.log('Profile fetch skipped - user is logged out and not first attempt');
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
        // Try to refresh the token even for first-time visitors
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
            if (handleSessionExpiredRef.current) {
              handleSessionExpiredRef.current();
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
  }, []); // logout is intentionally not in the dependency array to avoid circular reference

  /**
   * Validate user session by trying to get user profile
   */
  const validateSession = useCallback(async () => {
    try {
      // If we already know the user is logged out but this is the first time, still try
      if (window.isUserLoggedOut() && !isFirstAuthAttempt) {
        console.log('Session validation skipped - user is known to be logged out and not first attempt');
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
        
        // Reset logged out state in API client
        if (typeof api.resetLoggedOutState === 'function') {
          api.resetLoggedOutState();
        }
        
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
  }, [getProfile]);

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
      
      // Update API client state
      if (typeof api.setUserLoggedOut === 'function') {
        api.setUserLoggedOut();
      }
      
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

  /**
   * Handle session expiration by triggering logout
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
    
    logout(true);
  }, [logout]);

  // Store the handleSessionExpired function in a ref for access from other functions
  useEffect(() => {
    handleSessionExpiredRef.current = handleSessionExpired;
  }, [handleSessionExpired]);

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
    
    // Set isFirstAuthAttempt to true for fresh initialization
    isFirstAuthAttempt = true;
    
    // Reset logged out state to allow fresh token refresh attempts
    if (typeof api.resetLoggedOutState === 'function') {
      api.resetLoggedOutState();
    } else if (window.resetLoggedOutState) {
      window.resetLoggedOutState();
    }
    
    try {
      setLoading(true);
      
      // ENHANCEMENT: Try explicit token refresh first before any API calls
      let refreshSuccessful = false;
      
      try {
        console.log("Attempting proactive token refresh during initialization");
        await refreshAuthToken();
        refreshSuccessful = true;
        console.log("Token refresh successful during initialization");
      } catch (refreshError) {
        console.log("Initial token refresh attempt failed:", refreshError.message);
      }
      
      // Now try to get user profile to verify authentication
      try {
        // Check if we have a valid session by fetching the user profile
        await validateSession();
        console.log('Authentication initialized successfully');
      } catch (profileError) {
        console.log("Profile fetch failed:", profileError.message);
        // Reset auth state in case of error
        setUser(null);
        setSessionValid(false);
        isAuthenticated = false;
      }
    } catch (error) {
      console.error('Auth initialization error:', error.message);
      // Reset auth state in case of error
      setUser(null);
      setSessionValid(false);
      isAuthenticated = false;
    } finally {
      setLoading(false);
      setInitialized(true);
      isAuthInitialized = true;
      initializingRef.current = false;
      // After initialization, mark this as not the first attempt anymore
      isFirstAuthAttempt = false;
    }
  }, [refreshAuthToken, validateSession]);

  /**
   * Force check and restoration of authentication if possible
   * This can be called from components that need to ensure user is authenticated
   */
  const ensureAuthenticated = useCallback(async () => {
    console.log('Explicitly checking and ensuring authentication');
    
    if (user && sessionValid && isAuthenticated) {
      console.log('User is already authenticated, no need to check');
      return true;
    }
    
    // Reset isFirstAuthAttempt flag to ensure we try token refresh
    isFirstAuthAttempt = true;
    
    // Reset logged out state for a fresh attempt
    if (typeof api.resetLoggedOutState === 'function') {
      api.resetLoggedOutState();
    } else if (window.resetLoggedOutState) {
      window.resetLoggedOutState();
    }
    
    // Use the new specialized method
    const authRestored = await authApi.ensureAuthentication();
    
    if (authRestored) {
      console.log('Authentication restored successfully');
      // Refresh user profile
      try {
        const profile = await authApi.getProfile();
        if (profile) {
          setUser(profile);
          setSessionValid(true);
          isAuthenticated = true;
          return true;
        }
      } catch (error) {
        console.error('Failed to get profile after authentication restoration', error);
      }
    }
    
    console.log('Failed to restore authentication');
    return false;
  }, [user, sessionValid]);

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
      
      // Reset logged out state in API client
      if (typeof api.resetLoggedOutState === 'function') {
        api.resetLoggedOutState();
      } else if (window.resetLoggedOutState) {
        window.resetLoggedOutState();
      }
      
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

  /**
   * Register a new user with the API
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
            
            // Store terms and cookie acceptance in localStorage
            localStorage.setItem('termsAccepted', 'true');
            localStorage.setItem('cookieConsent', 'accepted');
            
            // Reset logged out state in API client
            if (typeof api.resetLoggedOutState === 'function') {
              api.resetLoggedOutState();
            } else if (window.resetLoggedOutState) {
              window.resetLoggedOutState();
            }
      } else {
            console.warn('Registration successful but unable to fetch user profile');
          }
        } catch (profileError) {
          // Handle case where profile fetch fails after successful registration
          console.error('Failed to fetch profile after registration:', profileError);
          // We can still consider the registration a success even if we couldn't fetch the profile
          // Still set terms acceptance as the user has completed registration
          localStorage.setItem('termsAccepted', 'true');
          localStorage.setItem('cookieConsent', 'accepted');
        }
      }
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Extract error message from the error or set a default
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Initialize authentication on component mount
  useEffect(() => {
    // Run immediately for initial load
    initializeAuth();
    
    // Also re-run after document becomes visible again (tab switch)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthInitialized) {
        console.log('Document became visible, validating session...');
        validateSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initializeAuth, validateSession]);

  // Set up event listeners for auth events
  useEffect(() => {
    // Handle session expiration events
    const handleSessionExpiredEvent = (event) => {
      console.log('Session expired event received with reason:', event.detail?.reason);
      
      if (event.detail?.reason === 'refresh_token_missing') {
        // Only show notification for established sessions
        if (!isFirstAuthAttempt) {
          notificationService.showWarning('Your session has expired. Please log in again.');
        }
        logout(true);
      }
    };
    
    // Handle explicit logout events
    const handleLogoutEvent = (event) => {
      console.log('Logout event received');
      logout(true);
    };
    
    // Handle token refresh needed events
    const handleTokenRefreshEvent = (event) => {
      console.log('Token refresh event received');
      refreshAuthToken()
        .then(() => console.log('Token refresh successful via event'))
        .catch(error => console.log('Token refresh failed via event:', error.message));
    };
    
    // Add event listeners
    window.addEventListener('auth:sessionExpired', handleSessionExpiredEvent);
    window.addEventListener('auth:logout', handleLogoutEvent);
    window.addEventListener('auth:tokenRefreshNeeded', handleTokenRefreshEvent);
    
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpiredEvent);
      window.removeEventListener('auth:logout', handleLogoutEvent);
      window.removeEventListener('auth:tokenRefreshNeeded', handleTokenRefreshEvent);
    };
  }, [logout, refreshAuthToken]);
  
  // Context value
  const contextValue = {
    user,
    setUser,
    loading,
    initialized,
    isAuthenticated: () => isAuthenticated,
    sessionValid,
    refreshToken: refreshAuthToken,
    validateSession,
    login: (user) => {
      setUser(user);
      setSessionValid(true);
      isAuthenticated = true;
      isFirstAuthAttempt = false;
      
      // Reset logged out state in API client
      if (typeof api.resetLoggedOutState === 'function') {
        api.resetLoggedOutState();
      } else if (window.resetLoggedOutState) {
        window.resetLoggedOutState();
      }
    },
    logout,
    getProfile,
    isAdmin: () => user?.role === 'ADMIN',
    isExecutive: () => user?.role === 'EXECUTIVE',
    handleSessionExpired: () => handleSessionExpiredRef.current(),
    updateProfile: (userData) => {
      setUser(userData);
    },
    ensureAuthenticated,
    // Add the missing auth functions back
    requestOtp,
    verifyUserOtp,
    loginUser,
    registerUser
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};