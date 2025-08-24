import React from 'react';
import Card from '../../ui/Card';
import { formatPrice } from '../../../utils/format';

const AvailableFlats = ({ flatTypes, flatsByType, activeFlatType, setActiveFlatType }) => {
  if (!flatTypes || flatTypes.length === 0) {
    return null;
  }

  return (
    <Card variant="elegant" className="mb-3">
      <h2 className="text-base font-display font-semibold text-primary-900 mb-2">
        Available Flat Types
      </h2>
      
      {/* BHK Type Selection Tabs */}
      <div className="flex flex-wrap gap-1 mb-2">
        {flatTypes.map(type => {
          const variants = flatsByType[type].length;
          return (
            <button
              key={type}
              onClick={() => setActiveFlatType(type)}
              className={`px-2 py-0.5 rounded transition-all text-xs ${activeFlatType === type 
                  ? 'bg-primary-700 text-white shadow-sm' 
                  : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
              }`}
            >
              <span>{type}</span>
              <span className="text-xs opacity-90 ml-0.5">({variants})</span>
            </button>
          );
        })}
      </div>
      
      {/* Variants for the selected BHK type */}
      {activeFlatType && flatsByType[activeFlatType]?.length > 0 && (
        <div className="overflow-hidden rounded-md border border-neutral-200">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Area</th>
                <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-neutral-900 uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {flatsByType[activeFlatType].map((flat, index) => (
                <tr key={index} className="hover:bg-neutral-50">
                  <td className="px-3 py-1.5 whitespace-nowrap text-xs text-neutral-900 font-medium">{flat.area} sq ft</td>
                  <td className="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-primary-800">{formatPrice(flat.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Footnote about prices */}
      <div className="text-xs text-neutral-700 italic mt-2">
        * Prices include GST, stamp duty, and registration charges
      </div>
    </Card>
  );
};

export default AvailableFlats;
