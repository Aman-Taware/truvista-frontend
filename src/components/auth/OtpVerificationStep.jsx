import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * OTP Verification Step Component
 * The second step in the authentication flow - verifies the OTP sent to user's phone
 * Updated with enhanced mobile support and SMS autofill capability
 */
const OtpVerificationStep = ({ 
  phoneNumber, 
  otp, 
  setOtp, 
  onSubmit, 
  onChangeNumber, 
  loading, 
  message,
  onResendOtp,
  otpResendAttempts = 0,
  isResendingOtp = false
}) => {
  // Reference for the single OTP input field
  const otpInputRef = useRef(null);
  
  // Store timer reference to clear it when needed
  const timerRef = useRef(null);
  
  // Timer for resend OTP functionality
  const [countdown, setCountdown] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);
  
  // Function to start the countdown timer
  const startCountdownTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset states
    setCountdown(30);
    setIsResendActive(false);
    
    // Start new timer
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Start countdown when component mounts and setup autofocus
  useEffect(() => {
    // Focus the input field
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
    
    // Initialize countdown timer
    startCountdownTimer();
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  // Handle input change for OTP
  const handleInputChange = (e) => {
    const value = e.target.value;
    
    // Only allow digits and limit to 6 characters
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      
      // If input is complete (6 digits), auto-submit after a short delay to allow user to see the completed OTP
      if (value.length === 6) {
        setTimeout(() => {
          onSubmit();
        }, 300);
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Only submit if OTP is complete (6 digits)
    if (otp.length === 6) {
      onSubmit();
    }
  };
  
  // Handle OTP resend
  const handleResendOtp = () => {
    // Reset OTP input
    setOtp('');
    
    // Restart the countdown timer
    startCountdownTimer();
    
    // Refocus the input
    if (otpInputRef.current) {
      otpInputRef.current.focus();
    }
    
    // Use the direct resend function instead of going back to phone input
    onResendOtp();
  };
  
  // Create an array of the OTP digits for display
  const otpDigits = otp.split('').concat(Array(6 - otp.length).fill(''));
  
  // Check if maximum resend attempts reached
  const isMaxResendAttemptsReached = otpResendAttempts >= 2; // Max 3 attempts (initial + 2 resends)
  
  // Calculate remaining attempts
  const remainingResendAttempts = 2 - otpResendAttempts;
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with back button */}
      <div className="flex items-center space-x-2 mb-4">
        <button 
          type="button" 
          onClick={onChangeNumber}
          disabled={loading || isResendingOtp}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-gray-600">Change phone number</span>
      </div>
      
      {/* Verification message */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Verify Your Phone</h3>
        <p className="text-gray-600">
          We've sent a 6-digit OTP to <span className="font-medium">+91 {phoneNumber}</span>
        </p>
      </div>
      
      {/* OTP input form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hidden input field for actual OTP input and autofill */}
        <div className="relative">
          <input
            ref={otpInputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            value={otp}
            onChange={handleInputChange}
            maxLength={6}
            className="opacity-0 absolute w-full h-full top-0 left-0 z-10 cursor-pointer"
            aria-label="Enter OTP"
            required
          />
          
          {/* Visual OTP boxes for display */}
          <div className="flex justify-center gap-3">
            {otpDigits.map((digit, index) => (
              <div
                key={index}
                onClick={() => otpInputRef.current?.focus()}
                className={`w-12 h-12 flex items-center justify-center text-center text-lg font-semibold border-2 ${
                  digit ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
                } rounded-lg cursor-pointer transition-all`}
              >
                {digit}
              </div>
            ))}
          </div>
        </div>
        
        {/* Error/success message */}
        {message && (
          <div className={`text-sm ${message.type === 'error' ? 'text-red-600 bg-red-50 p-3 rounded-md border border-red-200' : 'text-green-600 bg-green-50 p-3 rounded-md border border-green-200'}`}>
            {message.text}
          </div>
        )}
        
        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || otp.length !== 6}
          loading={loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </Button>
        
        {/* Resend OTP option */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the OTP?
            {!isMaxResendAttemptsReached && remainingResendAttempts > 0 && (
              <span className="ml-1 text-gray-500">
                ({remainingResendAttempts} resend attempt{remainingResendAttempts !== 1 ? 's' : ''} remaining)
              </span>
            )}
          </p>
          
          {isResendActive ? (
            isMaxResendAttemptsReached ? (
              <p className="mt-1 text-sm text-red-500">
                Maximum OTP request attempts reached. Please try again after some time.
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendingOtp || isMaxResendAttemptsReached}
                className={`mt-1 flex items-center justify-center mx-auto ${
                  isResendingOtp || isMaxResendAttemptsReached ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-primary-dark'
                } focus:outline-none text-sm`}
              >
                <RefreshCw size={14} className={`mr-1 ${isResendingOtp ? 'animate-spin' : ''}`} />
                {isResendingOtp ? 'Sending...' : 'Resend OTP'}
              </button>
            )
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Resend available in <span className="font-medium">{countdown}s</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default OtpVerificationStep; 