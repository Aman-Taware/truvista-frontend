import React from 'react';
import Card from '../../ui/Card';

const PropertyDescription = ({ name, description }) => {
  if (!description) {
    return null;
  }

  return (
    <Card variant="elegant" className="mb-3">
      <h2 className="text-base font-display text-primary-900 font-bold mb-2">
        About {name}
      </h2>
      <div className="text-sm text-neutral-900 font-medium leading-relaxed whitespace-pre-wrap">
        {description}
      </div>
    </Card>
  );
};

export default PropertyDescription;
