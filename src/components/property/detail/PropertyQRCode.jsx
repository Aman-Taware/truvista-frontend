import React from 'react';
import Card from '../../ui/Card';
import { getImageUrl } from '../../../utils/media';

const PropertyQRCode = ({ name, reraNo, reraUrl, qrCodeImage }) => {
  const qrCodeSrc = qrCodeImage 
    ? getImageUrl(qrCodeImage) 
    : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reraUrl || window.location.href)}`;

  const handleImageError = (e) => {
    console.error("Failed to load QR code image from backend.");
    e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(reraUrl || window.location.href)}`;
  };

  return (
    <Card variant="elegant" className="mb-3">
      <h2 className="text-base font-display font-semibold text-primary-900 mb-2">
        Property QR Code
      </h2>
      <div className="flex flex-col items-center">
        <div className="mb-2">
          <a 
            href={reraUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            title="Click to view RERA details"
          >
            <img 
              src={qrCodeSrc}
              alt={`QR Code for ${name}`}
              className="w-24 h-24 cursor-pointer"
              onError={handleImageError}
            />
          </a>
        </div>
        
        {reraNo && (
          <div className="text-center mb-1">
            <div className="font-medium text-xs text-neutral-900">RERA No: {reraNo}</div>
          </div>
        )}
        
        <div className="text-center">
          <div className="text-xs text-neutral-800 max-w-md mb-1">
            Scan to view on mobile
          </div>
          
          <div className="text-xs text-neutral-700 max-w-md text-center">
            {name} Details are available at <a href="https://maharera.mahaonline.gov.in" target="_blank" rel="noopener noreferrer" className="text-primary-700 hover:underline">maharera.mahaonline.gov.in</a> under registered projects.
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PropertyQRCode;
