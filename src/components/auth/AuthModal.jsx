import React, { useState, useEffect, useContext } from 'react';
import { X } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext';
import { NotificationContext } from '../../contexts/NotificationContext';
import PhoneInputStep from './PhoneInputStep';
import OtpVerificationStep from './OtpVerificationStep';
import RegistrationStep from './RegistrationStep';
import DeactivatedAccountMessage from './DeactivatedAccountMessage';
import Modal from '../ui/Modal';

/**
 * Authentication Modal Component
 * Handles the entire authentication flow: Phone input, OTP verification, and Registration (if new user)
 * Updated with the revised implementation strategy for improved UI/UX
 */
const AuthModal = ({ isOpen, onClose }) => {
  const auth = useContext(AuthContext);
  const { showNotification } = useContext(NotificationContext);
  
  // Authentication flow steps
  const STEPS = {
    PHONE_INPUT: 'phone_input',
    OTP_VERIFICATION: 'otp_verification',
    REGISTRATION: 'registration',
    COMPLETE: 'complete',
    ACCOUNT_DEACTIVATED: 'account_deactivated'
  };
  
  // State
  const [authStep, setAuthStep] = useState(STEPS.PHONE_INPUT);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [authError, setAuthError] = useState(null);
  const [deactivationMessage, setDeactivationMessage] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0); // Track OTP verification attempts
  const [otpResendAttempts, setOtpResendAttempts] = useState(0); // Track OTP resend attempts
  
  // Loading states
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false); // New loading state for OTP resend
  
  // Registration data
  const [registrationData, setRegistrationData] = useState({
    name: '',
    email: '',
    preferredFlatType: '',
    minBudget: 0,
    maxBudget: 0,
    phoneNumber: '',
    otp: '',
    role: 'USER' // Add default role, required by the backend
  });
  
  // Update phone number and OTP in registration data when they change
  useEffect(() => {
    if (phoneNumber) {
      setRegistrationData(prev => ({ ...prev, phoneNumber }));
    }
  }, [phoneNumber]);
  
  useEffect(() => {
    if (otp) {
      setRegistrationData(prev => ({ ...prev, otp }));
    }
  }, [otp]);
  
  // Reset the modal state when it closes
  useEffect(() => {
    if (!isOpen) {
      // Wait for animation to complete before resetting
      setTimeout(() => {
        setAuthStep(STEPS.PHONE_INPUT);
        setPhoneNumber('');
        setOtp('');
        setAuthError(null);
        setOtpAttempts(0); // Reset OTP attempts when modal closes
        setOtpResendAttempts(0); // Reset OTP resend attempts when modal closes
      }, 300);
    }
  }, [isOpen]);
  
  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!phoneNumber || phoneNumber.length !== 10) {
      setAuthError({ type: 'error', text: 'Please enter a valid 10-digit phone number' });
      return;
    }
    
    try {
      setIsSubmittingPhone(true);
      setAuthError(null);
      setOtpAttempts(0); // Reset OTP attempts when requesting new OTP
      setOtpResendAttempts(0); // Reset OTP resend attempts counter
      
      const response = await auth.requestOtp(phoneNumber);
      
      if (response.success) {
        // Move to OTP verification step
        setAuthStep(STEPS.OTP_VERIFICATION);
      } else {
        setAuthError({ type: 'error', text: response.message || 'Failed to send OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      setAuthError({ type: 'error', text: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmittingPhone(false);
    }
  };
  
  // Handle OTP resend with attempt limiting
  const handleResendOtp = async () => {
    // Check if maximum resend attempts reached
    if (otpResendAttempts >= 2) { // 3 total attempts (initial + 2 resends)
      setAuthError({
        type: 'error',
        text: 'Maximum OTP request attempts reached. Please try again after some time.'
      });
      return;
    }
    
    try {
      setIsResendingOtp(true);
      setAuthError(null);
      setOtp(''); // Clear the OTP input field
      
      // Increment resend counter before the request
      setOtpResendAttempts(prev => prev + 1);
      
      const response = await auth.requestOtp(phoneNumber);
      
      if (response.success) {
        // Notify user about successful resend
        setAuthError({ 
          type: 'success', 
          text: `OTP resent successfully. You have ${2 - otpResendAttempts} resend attempt(s) remaining.` 
        });
      } else {
        setAuthError({ type: 'error', text: response.message || 'Failed to resend OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setAuthError({ type: 'error', text: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsResendingOtp(false);
    }
  };
  
  // Handle OTP verification
  const handleOtpVerify = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Silently validate OTP format without showing prompt
    // Still prevent API calls with invalid format
    if (!otp || otp.length !== 6) {
      return; // Silently return without showing error
    }
    
    // Check if maximum OTP attempts reached
    if (otpAttempts >= 3) {
      setAuthError({ 
        type: 'error', 
        text: 'Maximum OTP verification attempts reached. Please request a new OTP.'
      });
      return;
    }
    
    try {
      setIsVerifyingOtp(true);
      setAuthError(null);
      
      const response = await auth.verifyUserOtp(phoneNumber, otp);
      console.log("OTP verification response:", response);
      
      if (response.success) {
        // Reset attempts counter on success
        setOtpAttempts(0);
        
        if (response.data === 'SIGNUP') {
          // New user, move to registration step
          // Ensure phone, OTP and role are set in registration data
          setRegistrationData(prev => ({
            ...prev,
            phoneNumber: phoneNumber,
            otp: otp,
            role: 'USER' // Ensure role is set, as it's required by the backend
          }));
          
          console.log("Moving to registration with data:", {
            phoneNumber,
            otp,
            role: 'USER',
            registrationData: {
              ...registrationData,
              phoneNumber,
              otp,
              role: 'USER'
            }
          });
          
          setAuthStep(STEPS.REGISTRATION);
        } else if (response.data === 'LOGIN') {
          // Existing user, proceed to login
          await handleLogin();
        }
      } else {
        // Increment attempt counter on failed verification
        setOtpAttempts(prevAttempts => prevAttempts + 1);
        const remainingAttempts = 3 - (otpAttempts + 1);
        
        // Check for account deactivation
        if (response.code === 'ACCOUNT_DEACTIVATED') {
          console.log("Account deactivated detected during OTP verification:", response.message);
          setDeactivationMessage(response.message || 'Your account has been deactivated. Please contact administrator.');
          setAuthStep(STEPS.ACCOUNT_DEACTIVATED);
        } else {
          // Show attempts remaining in error message
          const attemptsMessage = remainingAttempts > 0 
            ? ` (${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining)`
            : '';
          
          setAuthError({ 
            type: 'error', 
            text: (response.message || 'Failed to verify OTP. Please try again.') + attemptsMessage
          });
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Increment attempt counter on error
      setOtpAttempts(prevAttempts => prevAttempts + 1);
      const remainingAttempts = 3 - (otpAttempts + 1);
      
      // Check if the error contains deactivation information
      if (error.response?.data?.message?.includes('deactivated')) {
        const errorMessage = error.response.data.message;
        console.log("Account deactivated from error during OTP verification:", errorMessage);
        setDeactivationMessage(errorMessage || 'Your account has been deactivated. Please contact administrator.');
        setAuthStep(STEPS.ACCOUNT_DEACTIVATED);
      } else {
        // Show attempts remaining in error message
        const attemptsMessage = remainingAttempts > 0 
          ? ` (${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining)`
          : '';
        
        // Provide user friendly error message for common errors
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        // Enhanced error handling to ensure user-friendly messages
        if (error.response?.status === 400) {
          // Check if we have a detailed message from the backend
          if (error.response?.data?.message) {
            if (error.response.data.message.includes("invalid") || error.response.data.message.includes("Invalid")) {
              errorMessage = 'The OTP you entered is incorrect. Please check and try again.';
            } else if (error.response.data.message.includes("expire")) {
              errorMessage = 'This OTP has expired. Please request a new one.';
            } else {
              errorMessage = error.response.data.message;
            }
          } else {
            // Generic 400 error - likely invalid OTP
            errorMessage = 'The OTP you entered is incorrect. Please check and try again.';
          }
        } else if (error.message) {
          // Check if the error message contains status code information
          if (error.message.includes('status code 400')) {
            errorMessage = 'The OTP you entered is incorrect. Please check and try again.';
          } else if (error.message.includes('status code 401')) {
            errorMessage = 'Your session has expired. Please request a new OTP.';
          } else if (error.message.includes('Network Error')) {
            errorMessage = 'Network connection issue. Please check your internet connection and try again.';
          } else {
            // Use the error message but clean it up if needed
            errorMessage = error.message.replace(/^Request failed with status code \d+/, 'Verification failed');
          }
        }
        
        setAuthError({ 
          type: 'error', 
          text: errorMessage + attemptsMessage 
        });
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };
  
  // Handle login
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setAuthError(null);
      
      const response = await auth.loginUser(phoneNumber, otp);
      console.log("Login response in modal:", response);
      
      if (response.success) {
        // Login successful, close modal
        showNotification({
          type: 'success',
          message: "Welcome back! You're now logged in"
        });
        onClose();
      } else {
        // Check for account deactivation
        if (response.code === 'ACCOUNT_DEACTIVATED') {
          console.log("Account deactivated detected:", response.message);
          setDeactivationMessage(response.message || 'Your account has been deactivated. Please contact administrator.');
          setAuthStep(STEPS.ACCOUNT_DEACTIVATED);
        } else {
          setAuthError({ type: 'error', text: response.message || 'Failed to login. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Error logging in:', error);
      
      // Check if the error contains deactivation information
      if (error.response?.data?.message?.includes('deactivated')) {
        const errorMessage = error.response.data.message;
        console.log("Account deactivated from error:", errorMessage);
        setDeactivationMessage(errorMessage || 'Your account has been deactivated. Please contact administrator.');
        setAuthStep(STEPS.ACCOUNT_DEACTIVATED);
      } else {
        setAuthError({ type: 'error', text: error.message || 'An unexpected error occurred. Please try again.' });
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Handle registration
  const handleRegistration = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    // Enhanced debugging
    console.log("=== REGISTRATION DEBUG ===");
    console.log("Current Phone Number:", phoneNumber);
    console.log("Current OTP:", otp);
    console.log("Registration Data:", registrationData);
    
    // Validate registration data
    if (!registrationData.name || !registrationData.email || !registrationData.preferredFlatType) {
      setAuthError({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }
    
    // Validate phone number and OTP are present
    if (!registrationData.phoneNumber || registrationData.phoneNumber.length !== 10) {
      console.error("Phone number validation failed:", registrationData.phoneNumber);
      
      // Fix: If we have phoneNumber in the parent component but not in registrationData
      if (phoneNumber && phoneNumber.length === 10) {
        console.log("Using phoneNumber from parent state:", phoneNumber);
        // Update registrationData immediately 
        const updatedData = {
          ...registrationData,
          phoneNumber: phoneNumber,
          contactNo: phoneNumber // Add contactNo as well to ensure compatibility
        };
        setRegistrationData(updatedData);
        console.log("Updated registrationData with phoneNumber:", updatedData);
      } else {
        setAuthError({ type: 'error', text: 'Invalid phone number. Please start over.' });
        return;
      }
    }
    
    if (!registrationData.otp || registrationData.otp.length !== 6) {
      console.error("OTP validation failed:", registrationData.otp);
      
      // Fix: If we have OTP in the parent component but not in registrationData
      if (otp && otp.length === 6) {
        console.log("Using OTP from parent state:", otp);
        // Update registrationData immediately
        const updatedData = {
          ...registrationData,
          otp: otp
        };
        setRegistrationData(updatedData);
        console.log("Updated registrationData with OTP:", updatedData);
      } else {
        setAuthError({ type: 'error', text: 'Invalid OTP. Please start over.' });
        return;
      }
    }
    
    try {
      setIsRegistering(true);
      setAuthError(null);
      
      // Construct final registration data, ensuring phoneNumber and OTP are included
      const finalRegistrationData = {
        ...registrationData,
        phoneNumber: phoneNumber, // Explicitly use the parent state value
        contactNo: phoneNumber, // Explicitly add contactNo field for backend
        otp: otp, // Explicitly use the parent state value
        role: 'USER' // Ensure role is included
      };
      
      console.log("Sending final registration data:", {
        ...finalRegistrationData,
        otp: '******', // Mask OTP for security in logs
        phoneNumber: '******' + finalRegistrationData.phoneNumber?.slice(-4), // Mask most of phone number
        contactNo: '******' + finalRegistrationData.contactNo?.slice(-4) // Mask most of contact number
      });
      
      const response = await auth.registerUser(finalRegistrationData);
      
      if (response.success) {
        // Registration successful, close modal
        showNotification({
          type: 'success',
          message: "Welcome to Truvista! Your account has been created successfully"
        });
        onClose();
      } else {
        setAuthError({ type: 'error', text: response.message || 'Failed to create account. Please try again.' });
      }
    } catch (error) {
      console.error('Error registering:', error);
      setAuthError({ type: 'error', text: error.message || 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsRegistering(false);
    }
  };
  
  // Handle back button in OTP verification step
  const handleBackToPhone = () => {
    setAuthStep(STEPS.PHONE_INPUT);
    setOtp('');
    setAuthError(null);
    setOtpAttempts(0); // Reset OTP attempts when going back
    setOtpResendAttempts(0); // Reset OTP resend attempts when going back
  };
  
  // Render different steps based on authStep
  const renderStepContent = () => {
    switch (authStep) {
      case STEPS.PHONE_INPUT:
        return (
          <PhoneInputStep
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            onSubmit={handlePhoneSubmit}
            loading={isSubmittingPhone}
            message={authError}
          />
        );
      case STEPS.OTP_VERIFICATION:
        return (
          <OtpVerificationStep
            phoneNumber={phoneNumber}
            otp={otp}
            setOtp={setOtp}
            onSubmit={handleOtpVerify}
            onChangeNumber={handleBackToPhone}
            onResendOtp={handleResendOtp} // Pass the custom resend function
            otpResendAttempts={otpResendAttempts} // Pass the resend attempts count
            loading={isVerifyingOtp || isLoggingIn}
            isResendingOtp={isResendingOtp} // Pass resending state
            message={authError}
          />
        );
      case STEPS.REGISTRATION:
        return (
          <RegistrationStep
            registrationData={registrationData}
            setRegistrationData={setRegistrationData}
            onSubmit={handleRegistration}
            loading={isRegistering}
            message={authError}
          />
        );
      case STEPS.ACCOUNT_DEACTIVATED:
        return (
          <DeactivatedAccountMessage
            message={deactivationMessage}
          />
        );
      default:
        return null;
    }
  };
  
  // Get modal title based on step
  const getModalTitle = () => {
    switch (authStep) {
      case STEPS.PHONE_INPUT:
        return 'Sign In / Register';
      case STEPS.OTP_VERIFICATION:
        return 'Verify OTP';
      case STEPS.REGISTRATION:
        return 'Complete Registration';
      case STEPS.ACCOUNT_DEACTIVATED:
        return 'Account Deactivated';
      default:
        return 'Authentication';
    }
  };
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      size="md"
    >
      <div className="py-2 animate-fadeIn">
        {renderStepContent()}
      </div>
    </Modal>
  );
};

export default AuthModal; 