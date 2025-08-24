import React from 'react';
import Button from '../../ui/Button';

const StickyFooter = ({ 
  inShortlist, 
  checkingShortlist, 
  toggleShortlist, 
  userHasBooking, 
  checkingBookings, 
  userBookingDetails, 
  handleBookSiteVisit
}) => {

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600';
      case 'PENDING': return 'text-yellow-600';
      case 'CANCELLED': return 'text-red-600';
      default: return 'text-neutral-600';
    }
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white px-3 py-2 shadow-lg flex space-x-2 z-10 border-t border-neutral-200">
      <Button
        variant="outline"
        className="flex-1 text-xs border-primary-200 text-primary-800 hover:bg-primary-50 shadow-sm py-1.5 flex items-center justify-center"
        onClick={toggleShortlist}
        disabled={checkingShortlist}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 mr-1 inline-block ${inShortlist ? 'text-red-500 fill-red-500' : 'text-primary-600'}`} 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          fill={inShortlist ? 'currentColor' : 'none'}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span className="inline-block">{inShortlist ? 'Shortlisted' : 'Add to Shortlist'}</span>
      </Button>
      
      {userHasBooking && userBookingDetails ? (
        <div className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-neutral-100 rounded-md border border-neutral-200 cursor-not-allowed">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="inline-block">
            Visit Booked | {formatDisplayDate(userBookingDetails.visitDate)} |
            <span className={`ml-1 font-medium ${getStatusColor(userBookingDetails.status)}`}>
              {userBookingDetails.status}
            </span>
          </span>
        </div>
      ) : checkingBookings ? (
        <div className="flex-1 flex items-center justify-center px-3 py-2 text-xs bg-neutral-100 rounded-md border border-neutral-200">
          <svg className="animate-spin h-4 w-4 mr-1 inline-block text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="inline-block">Checking Booking Status...</span>
        </div>
      ) : (
        <Button
          variant="primary"
          className="flex-1 text-xs flex items-center justify-center"
          onClick={handleBookSiteVisit}
          disabled={userHasBooking || checkingBookings}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="inline-block">Book Site Visit</span>
        </Button>
      )}
    </div>
  );
};

export default StickyFooter;
