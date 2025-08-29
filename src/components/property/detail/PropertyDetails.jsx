import React from 'react';
import Card from '../../ui/Card';

const PropertyDetails = ({ characteristics }) => {
  if (!characteristics || characteristics.length === 0) {
    return null;
  }

  return (
    <Card variant="elegant" className="mb-3">
      <h2 className="text-base font-display font-semibold text-primary-900 mb-2">
        Property Details
      </h2>
      <div className="divide-y divide-neutral-100">
        {characteristics.map((char, index) => (
          <div key={index} className="p-2 flex justify-between items-center">
            <div className="text-xs text-neutral-900 font-medium">{char.keyName}</div>
            <div className="text-xs text-neutral-800">{char.valueName}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PropertyDetails;
