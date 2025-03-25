import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { formatPrice, formatPriceRange } from '../../utils/format';
import Card from '../ui/Card';
import CachedImage from '../CachedImage';

/**
 * PropertyCard Component - Compact and Readable Design
 * 
 * Displays property information in a card format based on PropertyCardDTO structure
 * 
 * @param {Object} property - The property data (matches PropertyCardDTO from backend)
 * @param {Long} property.id - Property ID
 * @param {string} property.name - Property name
 * @param {string} property.location - Property location
 * @param {number} property.minPrice - Minimum property price
 * @param {number} property.maxPrice - Maximum property price
 * @param {string} property.imageUrl - Main property image URL
 * @param {boolean} property.featured - Whether property is featured
 * @param {Array} property.flatTypes - Available flat types (e.g., ['2 BHK', '3 BHK'])
 * @param {string} property.possessionDate - Expected possession date (ISO format)
 * @param {string} property.workDone - Construction progress information
 * @param {string} property.status - Property status
 * @param {string} className - Additional CSS classes
 * @param {Function} onPropertyClick - Function to handle property click
 */
const PropertyCard = ({ property, className = '', onPropertyClick }) => {
  const [imageError, setImageError] = useState(false);
  const {
    id,
    name,
    location,
    minPrice,
    maxPrice,
    imageUrl,
    featured,
    isFeatured,
    flatTypes = [],
    possessionDate,
    workDone,
    status
  } = property;

  // Determine if the property is featured (checking both field names for compatibility)
  const isPropertyFeatured = featured || isFeatured || false;

  // Format possession date if it exists
  const formattedPossessionDate = possessionDate ? 
    new Date(possessionDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  // Get the badge color based on status - With distinct colors for each status
  const getStatusBadgeColor = (status) => {
    if (!status) return 'bg-white/80 text-neutral-700';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('under') && statusLower.includes('construction')) {
      return 'bg-white/80 text-warning-700';
    } else if (statusLower.includes('nearing') || statusLower.includes('near') || statusLower.includes('soon')) {
      return 'bg-white/80 text-green-700';
    } else if (statusLower.includes('ready') || statusLower.includes('move')) {
      return 'bg-white/80 text-primary-700';
    } else {
      return 'bg-white/80 text-neutral-700';
    }
  };
  
  // Get status dot color
  const getStatusDotColor = (status) => {
    if (!status) return 'bg-neutral-500';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('under') && statusLower.includes('construction')) {
      return 'bg-warning-600';
    } else if (statusLower.includes('nearing') || statusLower.includes('near') || statusLower.includes('soon')) {
      return 'bg-green-600';
    } else if (statusLower.includes('ready') || statusLower.includes('move')) {
      return 'bg-primary-600';
    } else {
      return 'bg-neutral-500';
    }
  };
  
  // Format status text to be more concise
  const formatStatusText = (status) => {
    if (!status) return '';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('under') && statusLower.includes('construction')) {
      return 'Under Construction';
    } else if (statusLower.includes('nearing') || statusLower.includes('near')) {
      return 'Nearing Possession';
    } else if (statusLower.includes('ready') || statusLower.includes('move')) {
      return 'Ready to Move';
    } else {
      return status;
    }
  };

  const handleClick = () => {
    if (onPropertyClick) {
      onPropertyClick(id);
    }
  };

  // Handle image loading errors
  const handleImageError = () => {
    console.error(`Failed to load property image for property ID: ${id}`);
    setImageError(true);
  };

  // Get proper image URL or fallback
  const getImageUrl = () => {
    if (imageError) {
      return 'https://via.placeholder.com/800x600?text=Property+Image+Not+Available';
    }
    
    if (!imageUrl) {
      return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&h=600&fit=crop'; 
    }

    // If URL starts with a relative path, convert to absolute
    if (imageUrl.startsWith('/')) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      return `${baseUrl}${imageUrl}`;
    }
    
    // If URL is an S3 URL containing S3 bucket name, ensure it's properly formatted
    if (imageUrl.includes('truvista.demo.storage')) {
      // Make sure it's an https URL
      if (!imageUrl.startsWith('http')) {
        return `https://s3.ap-south-1.amazonaws.com/${imageUrl.replace(/^.*truvista\.demo\.storage\//, 'truvista.demo.storage/')}`;
      }
    }
    
    return imageUrl;
  };

  return (
    <Card 
      variant="property" 
      className={`overflow-hidden ${className}`}
      hover={true}
    >
      {/* Image section with cleaner layout */}
      <div className="relative">
        {/* Property image */}
        <div 
          onClick={handleClick} 
          className="relative cursor-pointer h-44 overflow-hidden"
        >
          <CachedImage 
            src={getImageUrl()} 
            alt={name} 
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out hover:scale-105" 
            onError={handleImageError}
            fallbackSrc="https://via.placeholder.com/800x600?text=Property+Image+Not+Available"
          />
          
          {/* Status badge - Minimal dot with text design */}
          {status && (
            <div className="absolute top-2 left-2">
              <div className={`flex items-center px-1.5 py-0.5 bg-white/80 backdrop-blur-sm text-[10px] font-medium rounded-full shadow-sm ${getStatusBadgeColor(status)}`}>
                <span className={`h-1.5 w-1.5 rounded-full mr-1 ${getStatusDotColor(status)}`}></span>
                {formatStatusText(status)}
              </div>
            </div>
          )}
          
          {/* Featured badge - Minimal design with translucent background */}
          {isPropertyFeatured && (
            <div className="absolute bottom-2 right-2">
              <div className="bg-secondary-500/80 backdrop-blur-sm text-primary-900 px-1.5 py-0.5 text-[10px] font-medium rounded-full shadow-sm">
                Featured
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Property details - More compact with less padding */}
      <div className="p-3">
        {/* Property name - Moved from image overlay */}
        <h3 className="font-display font-bold text-xl text-primary-800 mb-1 line-clamp-1 hover:text-primary-600 cursor-pointer" onClick={handleClick}>
          {name}
        </h3>
        
        {/* Location - Moved from image overlay */}
        <div className="flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-600 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs text-neutral-700 font-medium truncate">{location}</span>
        </div>
        
        {/* Price with asterisk */}
        <div className="mb-2 pb-2 border-b border-neutral-100">
          <p className="text-l font-bold text-primary-700">
            {formatPriceRange(minPrice, maxPrice)}*
          </p>
        </div>
        
        {/* Property features in horizontal layout for better space usage */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {/* Flat Types */}
          {flatTypes && flatTypes.length > 0 && (
            <div className="flex flex-col">
              <p className="text-xs text-neutral-700 font-medium mb-0.5">Flat Types</p>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary-600 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <p className="text-xs font-medium text-neutral-900 truncate">{flatTypes.join(', ')}</p>
              </div>
            </div>
          )}
          
          {/* Construction Progress */}
          {workDone && (
            <div className="flex flex-col">
              <p className="text-xs text-neutral-700 font-medium mb-0.5">Construction</p>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-warning-600 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-xs font-medium text-neutral-900 truncate">{workDone} %</p>
              </div>
            </div>
          )}
          
          {/* Possession Date */}
          {formattedPossessionDate && (
            <div className="flex flex-col">
              <p className="text-xs text-neutral-700 font-medium mb-0.5">Possession</p>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-success-600 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs font-medium text-neutral-900 truncate">{formattedPossessionDate}</p>
              </div>
            </div>
          )}
        </div>
        
        {/* View Details Button - Smaller and more compact */}
        <button 
          onClick={handleClick}
          className="w-full py-2 px-3 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium transition-colors duration-300 flex items-center justify-center text-sm"
        >
          View Details
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
 
      </div>
    </Card>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    minPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    maxPrice: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    imageUrl: PropTypes.string,
    featured: PropTypes.bool,
    isFeatured: PropTypes.bool,
    flatTypes: PropTypes.arrayOf(PropTypes.string),
    possessionDate: PropTypes.string,
    workDone: PropTypes.string,
    status: PropTypes.string
  }).isRequired,
  className: PropTypes.string,
  onPropertyClick: PropTypes.func
};

export default PropertyCard; 