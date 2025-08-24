import React, { useState, useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

/**
 * Phone Input Step Component
 * The first step in the authentication flow - captures user's phone number
 * Updated with the revised implementation strategy for improved UI/UX
 */
const PhoneInputStep = ({ phoneNumber, setPhoneNumber, onSubmit, loading, message }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus the input field when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle phone number input change
  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits and limit to 10 characters
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome message */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Truvista</h3>
        <p className="text-gray-600">
          Enter your phone number to sign in or create a new account
        </p>
      </div>

      {/* Phone input form */}
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          
          <div className={`flex items-center border-2 rounded-lg overflow-hidden transition-all duration-200 ${
            isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
          }`}>
            {/* Country code prefix */}
            <div className="flex items-center justify-center bg-gray-50 pl-3 pr-2 py-2 border-r border-gray-300">
              <Phone size={18} className="text-gray-500 mr-1" />
              <span className="text-gray-700 font-medium">+91</span>
            </div>
            
            {/* Phone number input */}
            <input
              id="phone"
              type="tel"
              ref={inputRef}
              value={phoneNumber}
              onChange={handlePhoneChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="flex-1 p-2 pl-3 focus:outline-none text-gray-800 bg-white"
              placeholder="Enter 10-digit number"
              autoComplete="tel"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
          </div>
          
          {/* Character count indicator */}
          <div className="flex justify-end">
            <span className={`text-xs ${
              phoneNumber.length === 10 ? 'text-green-600' : 'text-gray-500'
            }`}>
              {phoneNumber.length}/10
            </span>
          </div>
        </div>

        {/* Error message */}
        {message && (
          <div className={`text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
            {message.text}
          </div>
        )}

        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full"
          disabled={loading || phoneNumber.length !== 10}
          loading={loading}
        >
          {loading ? 'Sending OTP...' : 'Continue'}
        </Button>

        {/* Terms, privacy, and cookie notice */}
        <p className="text-xs text-center text-gray-500 mt-4">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>,{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>,{' '}
          and{' '}
          <Link to="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>
        </p>
      </form>
    </div>
  );
};

export default PhoneInputStep; 