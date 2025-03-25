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
  
  // Loading states
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  
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
  
  // Handle OTP verification
  const handleOtpVerify = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!otp || otp.length !== 6) {
      setAuthError({ type: 'error', text: 'Please enter a valid 6-digit OTP' });
      return;
    }
    
    try {
      setIsVerifyingOtp(true);
      setAuthError(null);
      
      const response = await auth.verifyUserOtp(phoneNumber, otp);
      console.log("OTP verification response:", response);
      
      if (response.success) {
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
        // Check for account deactivation
        if (response.code === 'ACCOUNT_DEACTIVATED') {
          console.log("Account deactivated detected during OTP verification:", response.message);
          setDeactivationMessage(response.message || 'Your account has been deactivated. Please contact administrator.');
          setAuthStep(STEPS.ACCOUNT_DEACTIVATED);
        } else {
          setAuthError({ type: 'error', text: response.message || 'Failed to verify OTP. Please try again.' });
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      // Check if the error contains deactivation information
      if (error.response?.data?.message?.includes('deactivated')) {
        const errorMessage = error.response.data.message;
        console.log("Account deactivated from error during OTP verification:", errorMessage);
        setDeactivationMessage(errorMessage || 'Your account has been deactivated. Please contact administrator.');
        setAuthStep(STEPS.ACCOUNT_DEACTIVATED);
      } else {
        setAuthError({ type: 'error', text: error.message || 'An unexpected error occurred. Please try again.' });
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
          phoneNumber: phoneNumber
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
        otp: otp, // Explicitly use the parent state value
        role: 'USER' // Ensure role is included
      };
      
      console.log("Sending final registration data:", finalRegistrationData);
      console.log("Final phoneNumber:", finalRegistrationData.phoneNumber);
      console.log("Final otp:", finalRegistrationData.otp);
      console.log("Final role:", finalRegistrationData.role);
      
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
            loading={isVerifyingOtp || isLoggingIn}
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