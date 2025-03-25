import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * OTP Verification Step Component
 * The second step in the authentication flow - verifies the OTP sent to user's phone
 * Updated with the revised implementation strategy for improved UI/UX
 */
const OtpVerificationStep = ({ 
  phoneNumber, 
  otp, 
  setOtp, 
  onSubmit, 
  onChangeNumber, 
  loading, 
  message 
}) => {
  // Array of references for each input field
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));
  
  // Timer for resend OTP functionality
  const [countdown, setCountdown] = useState(30);
  const [isResendActive, setIsResendActive] = useState(false);
  
  // Start countdown when component mounts
  useEffect(() => {
    // Focus the first input field
    if (inputRefs.current[0] && inputRefs.current[0].current) {
      inputRefs.current[0].current.focus();
    }
    
    // Initialize countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResendActive(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Cleanup timer on unmount
    return () => clearInterval(timer);
  }, []);
  
  // Handle input change for OTP digits
  const handleInputChange = (index, value) => {
    // Only allow digits
    if (/^\d*$/.test(value)) {
      // Create a new OTP with the updated value at the given index
      const newOtp = [...otp.split('')];
      newOtp[index] = value;
      
      // Update the OTP state
      setOtp(newOtp.join(''));
      
      // Move focus to the next input field if value is not empty
      if (value && index < 5 && inputRefs.current[index + 1]?.current) {
        inputRefs.current[index + 1].current.focus();
      }
    }
  };
  
  // Handle key down events
  const handleKeyDown = (index, e) => {
    // Move focus to the previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]?.current) {
      inputRefs.current[index - 1].current.focus();
    }
  };
  
  // Handle paste event
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data is a valid 6-digit OTP
    if (/^\d{6}$/.test(pastedData)) {
      setOtp(pastedData);
      
      // Focus the last input
      if (inputRefs.current[5]?.current) {
        inputRefs.current[5].current.focus();
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
    
    // Reset countdown
    setCountdown(30);
    setIsResendActive(false);
    
    // Refocus the first input
    if (inputRefs.current[0]?.current) {
      inputRefs.current[0].current.focus();
    }
    
    // Trigger onChangeNumber to go back to phone input (which will request a new OTP)
    onChangeNumber();
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with back button */}
      <div className="flex items-center space-x-2 mb-4">
        <button 
          type="button" 
          onClick={onChangeNumber}
          disabled={loading}
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
        {/* OTP input fields */}
        <div className="flex justify-center gap-3">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              ref={inputRefs.current[index]}
              type="text"
              maxLength={1}
              value={otp[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className="w-12 h-12 text-center text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
              required
            />
          ))}
        </div>
        
        {/* Error/success message */}
        {message && (
          <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
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
          </p>
          
          {isResendActive ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="mt-1 flex items-center justify-center mx-auto text-primary hover:text-primary-dark focus:outline-none text-sm"
            >
              <RefreshCw size={14} className="mr-1" />
              Resend OTP
            </button>
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