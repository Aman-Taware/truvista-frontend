import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';

/**
 * Terms Acceptance Modal Component
 * Displays a modal asking users to accept Terms of Service and Privacy Policy
 * Stores user's acceptance in localStorage
 */
const TermsAcceptance = () => {
  const [visible, setVisible] = useState(false);
  
  // Check if user has already accepted terms on component mount
  useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('termsAccepted');
    if (!hasAcceptedTerms) {
      // If user hasn't accepted yet, show the modal after a short delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 2000); // Show after 2 seconds, giving cookie banner time to display first
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle accept button click
  const handleAccept = () => {
    localStorage.setItem('termsAccepted', 'true');
    setVisible(false);
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-4">Terms of Service & Privacy Policy</h2>
          <div className="prose prose-sm mb-6">
            <p>
              Welcome to Truvista! Before you continue, we want to ensure you're aware of our policies.
            </p>
            <p>
              By using our services, you agree to our <Link to="/terms" className="text-primary-600 hover:underline font-medium">Terms of Service</Link>, <Link to="/privacy" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>, and <Link to="/cookies" className="text-primary-600 hover:underline font-medium">Cookie Policy</Link>.
            </p>
            <p>
              These documents outline how we collect, use, and protect your information, as well as your rights and responsibilities as a user of our platform.
            </p>
          </div>
          <div className="flex justify-end">
            <Button 
              variant="primary"
              onClick={handleAccept}
              className="w-full sm:w-auto"
            >
              I Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAcceptance; 