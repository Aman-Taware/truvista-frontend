import React, { useState, useEffect } from 'react';
import { User, Mail, Home, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
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
  
  // Terms acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Field-specific error states
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    general: '',
    terms: ''
  });
  
  // Clear errors when component remounts or message changes
  useEffect(() => {
    setErrors({ name: '', email: '', general: '', terms: '' });
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
  
  // Handle terms acceptance toggle
  const handleTermsAcceptance = (e) => {
    setTermsAccepted(e.target.checked);
    if (e.target.checked && errors.terms) {
      setErrors({ ...errors, terms: '' });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', email: '', general: '', terms: '' };
    
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
    
    // Terms acceptance validation
    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms of Service, Privacy Policy, and Cookie Policy to register';
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
      // Store acceptance in localStorage when user successfully submits the form
      if (termsAccepted) {
        localStorage.setItem('termsAccepted', 'true');
        localStorage.setItem('cookieConsent', 'accepted');
      }
      
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
                    ? 'border-primary bg-primary/20 text-primary font-bold shadow-sm relative'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <Home size={16} className="inline-block mr-1 -mt-0.5" />
                {type}
                {registrationData.preferredFlatType === type && (
                  <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                    <svg className="h-4 w-4 text-primary-600 fill-current" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="10" className="text-primary-600 fill-current"></circle>
                      <path
                        fill="white"
                        d="M14.59,5.58L8,12.17L4.41,8.59L3,10L8,15L16,7L14.59,5.58Z"
                      ></path>
                    </svg>
                  </span>
                )}
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
                    ? 'border-primary bg-primary/20 text-primary font-bold shadow-sm relative'
                    : 'border-gray-300 hover:border-gray-400 text-gray-700'
                }`}
              >
                <span className="font-medium mr-1">₹</span>
                {range.label}
                {registrationData.minBudget === range.min && registrationData.maxBudget === range.max && (
                  <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                    <svg className="h-4 w-4 text-primary-600 fill-current" viewBox="0 0 20 20">
                      <circle cx="10" cy="10" r="10" className="text-primary-600 fill-current"></circle>
                      <path
                        fill="white"
                        d="M14.59,5.58L8,12.17L4.41,8.59L3,10L8,15L16,7L14.59,5.58Z"
                      ></path>
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Submit button */}
        <div className="mt-6">
          {/* Terms acceptance checkbox */}
          <div className={`mb-4 ${errors.terms ? 'text-red-600' : ''}`}>
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={handleTermsAcceptance}
                className={`mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${errors.terms ? 'border-red-300' : ''}`}
              />
              <span className="ml-2 text-sm">
                I accept the <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>, <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>, and <Link to="/cookies" className="text-primary-600 hover:underline">Cookie Policy</Link>.
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm text-red-600 mt-1">{errors.terms}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
            loading={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </Button>
        </div>
        
        {/* Terms and privacy notice - keeping this for added visibility */}
        <p className="text-xs text-center text-gray-500 mt-4">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>,{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>, and{' '}
          <Link to="/cookies" className="text-primary hover:underline">
            Cookie Policy
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegistrationStep; 