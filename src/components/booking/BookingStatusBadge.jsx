import React from 'react';
import PropTypes from 'prop-types';

/**
 * BookingStatusBadge Component
 * Displays a styled badge with appropriate color based on booking status
 * 
 * @param {string} status - The booking status: CONFIRMED, PENDING, SCHEDULED, COMPLETED, etc.
 * @param {string} className - Additional CSS classes to apply
 */
const BookingStatusBadge = ({ status, className = '' }) => {
  // Default to 'Other' if no status provided
  const bookingStatus = status || 'Other';
  
  // Define badge styles based on status
  const getBadgeStyles = () => {
    switch (bookingStatus.toUpperCase()) {
      case 'CONFIRMED':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyles()} ${className}`}>
      {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1).toLowerCase()}
    </span>
  );
};

BookingStatusBadge.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string
};

export default BookingStatusBadge; 