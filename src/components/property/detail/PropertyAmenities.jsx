import React from 'react';
import Card from '../../ui/Card';

const getAmenityIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
};

const PropertyAmenities = ({ amenities }) => {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <Card variant="elegant" className="mb-3">
      <h2 className="text-base font-display font-semibold text-primary-900 mb-2">
        Amenities
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-1">
        {amenities.map((amenity, index) => (
          <div key={index} className="flex items-center space-x-1.5">
            {getAmenityIcon(amenity)}
            <span className="text-xs text-neutral-800">{amenity}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PropertyAmenities;
