import React from 'react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { getImageUrl } from '../../../utils/media';

const ContactCard = ({ assignedUser, handleWhatsAppInquiry }) => {
  return (
    <Card variant="default" className="overflow-hidden">
      <div className="p-3 bg-neutral-50 border-b border-neutral-200">
        <h3 className="font-bold text-sm text-primary-900">Contact Consultant</h3>
      </div>
      <div className="p-3">
        {assignedUser ? (
          <>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 mr-3 border-2 border-neutral-100 shadow-sm flex-shrink-0">
                <img 
                  src={getImageUrl(assignedUser.profilePicture)} 
                  alt={assignedUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-primary-900">{assignedUser.name}</div>
                <div className="text-primary-700 text-xs">Property Consultant</div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Button 
                variant="secondary"
                className="text-xs py-1.5 w-full flex items-center justify-center"
                onClick={() => window.open(`tel:${assignedUser.contactNo}`, '_self')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>Call Now</span>
              </Button>
              <Button 
                variant="primary"
                className="text-xs py-1.5 w-full flex items-center justify-center"
                onClick={handleWhatsAppInquiry}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
                <span>WhatsApp</span>
              </Button>
            </div>
          </>
        ) : (
          <div>
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-200 mr-3 border-2 border-neutral-100 shadow-sm flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop&auto=format" 
                  alt="Property Consultant"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-sm font-bold text-primary-900">Property Experts</div>
                <div className="text-primary-700 text-xs">Real Estate Advisors</div>
              </div>
            </div>
            <p className="text-xs text-neutral-700 text-center">For more details, please book a site visit.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContactCard;
