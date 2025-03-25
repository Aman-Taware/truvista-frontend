import React, { useState, useEffect } from 'react';
import { User, Mail, Home, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { FLAT_TYPES, PRICE_RANGES } from '../../constants/constants';

/**
 * Registration Step Component
 * The final step in the authentication flow - captures additional user information
 * Updated with improved error handling and field-level validation
 */
const RegistrationStep = ({ 
  registrationData, 
  setRegistrationData, 
  onSubmit, 
  loading, 
  message 
}) => {
  // Field focus states
  const [focusedField, setFocusedField] = useState(null);
  
  // Field-specific error states
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    general: ''
  });
  
  // Clear errors when component remounts or message changes
  useEffect(() => {
    setErrors({ name: '', email: '', general: '' });
  }, [message?.type]);
  
  // Handle input changes
  const handleChange = (field, value) => {
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    setRegistrationData({
      ...registrationData,
      [field]: value
    });
  };
  
  // Handle budget range selection
  const handleBudgetChange = (min, max) => {
    setRegistrationData({
      ...registrationData,
      minBudget: min,
      maxBudget: max
    });
  };
  
  // Handle flat type selection
  const handleFlatTypeChange = (type) => {
    setRegistrationData({
      ...registrationData,
      preferredFlatType: type
    });
  };
  
  // Validate form before submission
  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', email: '', general: '' };
    
    // Name validation
    if (!registrationData.name || registrationData.name.trim() === '') {
      newErrors.name = 'Name is required';
      valid = false;
    }
    
    // Email validation
    if (!registrationData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(registrationData.email)) {
      newErrors.email = 'Please enter a valid email address';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };
  
  // Handle form submission with validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      onSubmit();
    } catch (error) {
      console.error('Registration error:', error);
      
      // If there's a specific error message from the API
      if (error.response && error.response.data) {
        const { errorCode, message } = error.response.data;
        
        if (errorCode === 'EMAIL_ALREADY_EXISTS') {
          setErrors({ ...errors, email: 'This email is already registered' });
        } else if (errorCode === 'CONTACT_ALREADY_EXISTS') {
          setErrors({ ...errors, general: 'This phone number is already registered' });
        } else {
          setErrors({ ...errors, general: message || 'Registration failed. Please try again.' });
        }
      } else {
        setErrors({ ...errors, general: 'An error occurred during registration' });
      }
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome message */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Truvista</h3>
        <p className="text-gray-600">
          Let's complete your profile to get started
        </p>
      </div>
      
      {/* Registration form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* General error message */}
        {(message?.type === 'error' || errors.general) && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle size={18} className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <span>{errors.general || message?.text}</span>
          </div>
        )}
        
        {/* Success message */}
        {message?.type === 'success' && (
          <div className="bg-green-50 border border-green-100 text-green-600 px-4 py-3 rounded-lg">
            {message.text}
          </div>
        )}
        
        {/* Name input */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className={`flex items-center border-2 rounded-lg overflow-hidden transition-all duration-200 ${
            errors.name ? 'border-red-300 bg-red-50' : 
            focusedField === 'name' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-center bg-gray-50 p-2 border-r border-gray-300">
              <User size={18} className={errors.name ? 'text-red-500' : 'text-gray-500'} />
            </div>
            <input
              id="name"
              type="text"
              value={registrationData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your full name"
              className={`flex-1 p-2 pl-3 focus:outline-none text-gray-800 ${errors.name ? 'bg-red-50' : 'bg-white'}`}
              required
            />
          </div>
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>
        
        {/* Email input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className={`flex items-center border-2 rounded-lg overflow-hidden transition-all duration-200 ${
            errors.email ? 'border-red-300 bg-red-50' : 
            focusedField === 'email' ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-center bg-gray-50 p-2 border-r border-gray-300">
              <Mail size={18} className={errors.email ? 'text-red-500' : 'text-gray-500'} />
            </div>
            <input
              id="email"
              type="email"
              value={registrationData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              placeholder="Enter your email address"
              className={`flex-1 p-2 pl-3 focus:outline-none text-gray-800 ${errors.email ? 'bg-red-50' : 'bg-white'}`}
              required
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600 mt-1">{errors.email}</p>
          )}
        </div>
        
        {/* Preferred flat type */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Preferred Accommodation Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FLAT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleFlatTypeChange(type)}
                className={`py-2 px-3 border-2 rounded-md text-sm transition-all ${
                  registrationData.preferredFlatType === type
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <Home size={16} className="inline-block mr-1 -mt-0.5" />
                {type}
              </button>
            ))}
          </div>
        </div>
        
        {/* Budget range */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Budget Range
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRICE_RANGES.map((range, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleBudgetChange(range.min, range.max)}
                className={`py-2 px-3 border-2 rounded-md text-sm transition-all ${
                  registrationData.minBudget === range.min && registrationData.maxBudget === range.max
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <span className="font-medium mr-1">₹</span>
                {range.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Submit button */}
        <Button 
          type="submit" 
          className="w-full mt-4"
          disabled={loading}
          loading={loading}
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </Button>
        
        {/* Terms and privacy notice */}
        <p className="text-xs text-center text-gray-500 mt-4">
          By registering, you agree to our{' '}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
};

export default RegistrationStep; 