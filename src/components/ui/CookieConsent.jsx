import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * Cookie Consent Banner Component
 * Displays a banner at the bottom of the screen asking users to accept cookies
 * Stores user preferences in localStorage
 */
const CookieConsent = () => {
  const [visible, setVisible] = useState(false);
  
  // Check if user has already consented on component mount
  useEffect(() => {
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      // If user hasn't consented yet, show the banner after a short delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle accept button click
  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setVisible(false);
  };
  
  // Handle decline button click (still sets that user has made a choice but with declined value)
  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setVisible(false);
    
    // If user declines, you might want to disable non-essential cookies here
    // This is a placeholder for any logic you'd add to disable tracking
    console.log('User declined cookies - should disable non-essential cookies');
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0 sm:mr-4">
            <p>
              We use cookies to enhance your experience on our website. By continuing to browse, you agree to our use of cookies.
              Read our <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link> and <Link to="/cookies" className="text-primary-600 hover:underline">Cookie Policy</Link> to learn more.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={handleDecline}
              className="text-sm py-2"
            >
              Decline
            </Button>
            <Button 
              variant="primary"
              onClick={handleAccept}
              className="text-sm py-2"
            >
              Accept Cookies
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 