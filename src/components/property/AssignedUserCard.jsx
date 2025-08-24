import React from 'react';
import PropTypes from 'prop-types';

/**
 * AssignedUserCard Component
 * Displays contact information for the assigned property manager/admin
 * 
 * @param {Object} props
 * @param {Object} props.user - The assigned user object with contact details
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The AssignedUserCard component
 */
const AssignedUserCard = ({ user, className = '' }) => {
  if (!user) return null;
  
  // Function to format phone number for tel: links
  const formatPhoneForLink = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^0-9+]/g, '');
  };
  
  // Function to create WhatsApp link
  const getWhatsAppLink = (phone) => {
    return `https://wa.me/${formatPhoneForLink(phone)}`;
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200 ${className}`}>
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 px-4">
        <h2 className="text-base font-bold">Your Property Expert</h2>
      </div>
      
      <div className="p-4">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 mr-3 border-2 border-slate-100 shadow-sm flex items-center justify-center">
            {user.name ? (
              <div className="text-lg font-bold text-slate-700">
                {user.name.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2)}
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          <div>
            <div className="text-sm font-bold text-slate-800">{user.name}</div>
            <div className="text-emerald-600 text-xs">{user.role === 'ADMIN' ? 'Sr. Consultant' : 'Property Consultant'}</div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <a 
            href={`tel:${formatPhoneForLink(user.contactNo)}`}
            className="flex items-center justify-center px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md shadow-sm text-xs font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call Now
          </a>
          
          <a 
            href={getWhatsAppLink(user.contactNo)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm text-xs font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            WhatsApp
          </a>
          
          <a 
            href={`mailto:${user.email}`}
            className="flex items-center justify-center px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-md shadow-sm text-xs font-medium transition-colors mt-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </a>
        </div>
      </div>
    </div>
  );
};

AssignedUserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    contactNo: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
  }),
  className: PropTypes.string
};

export default AssignedUserCard; 