import React from 'react';
import { ShieldAlert, Mail, Phone } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Deactivated Account Message Component
 * Displayed when a user tries to login with a deactivated account
 * Updated with the revised implementation strategy for improved UI/UX
 */
const DeactivatedAccountMessage = ({ message }) => {
  // Contact email and phone for support
  const contactEmail = 'support@truvista.com';
  const contactPhone = '+91 1234567890';
  
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Icon and title */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <ShieldAlert size={36} className="text-red-600" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Deactivated</h3>
      </div>
      
      {/* Message */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p>{message || 'Your account has been deactivated. Please contact administrator for assistance.'}</p>
      </div>
      
      {/* Contact information */}
      <div className="space-y-4 bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-800">Contact Support</h4>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
            <Mail size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <a 
              href={`mailto:${contactEmail}`} 
              className="text-primary hover:underline"
            >
              {contactEmail}
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full">
            <Phone size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <a 
              href={`tel:${contactPhone.replace(/\s+/g, '')}`} 
              className="text-primary hover:underline"
            >
              {contactPhone}
            </a>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="space-y-3">
        <Button 
          className="w-full"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </Button>
        
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => window.open('https://truvista.com/help', '_blank')}
        >
          Visit Help Center
        </Button>
      </div>
    </div>
  );
};

export default DeactivatedAccountMessage; 