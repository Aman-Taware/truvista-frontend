import React, { useEffect } from 'react';
import PropertyCard from './PropertyCard';
import { preloadImages } from '../../utils/imageCache';

/**
 * PropertyList Component - Displays a grid of property cards
 * 
 * @param {Object} props
 * @param {Array} props.properties - Array of property objects
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.columns - Number of columns for desktop view (default: 3)
 * @param {boolean} props.isLoading - Whether properties are loading
 * @param {string} props.emptyMessage - Message to display when no properties
 * @param {Function} props.onPropertyClick - Function to handle property card clicks
 */
const PropertyList = ({
  properties = [],
  className = '',
  columns = 3,
  isLoading = false,
  emptyMessage = 'No properties found',
  onPropertyClick
}) => {
  // Helper to determine grid columns based on the columns prop
  const getGridCols = () => {
    switch (columns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-1 md:grid-cols-2';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  // Preload property images when properties are loaded
  useEffect(() => {
    if (!isLoading && properties.length > 0) {
      // Extract image URLs from properties
      const imageUrls = properties
        .map(property => {
          if (!property.imageUrl) return null;

          // Handle relative URLs
          if (property.imageUrl.startsWith('/')) {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            return `${baseUrl}${property.imageUrl}`;
          }
          
          return property.imageUrl;
        })
        .filter(Boolean); // Remove nulls

      // Preload images if we have valid URLs
      if (imageUrls.length > 0) {
        console.log(`Preloading ${imageUrls.length} property images`);
        preloadImages(imageUrls);
      }
    }
  }, [isLoading, properties]);

  // Loading skeleton UI
  if (isLoading) {
    return (
      <div className={`grid ${getGridCols()} gap-6 ${className}`}>
        {[...Array(6)].map((_, index) => (
          <div key={index} className="animate-pulse rounded-xl overflow-hidden shadow-elegant bg-white">
            {/* Image skeleton */}
            <div className="bg-neutral-200 h-64 relative">
              <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
                <div className="w-16 h-6 bg-neutral-300 rounded-md"></div>
              </div>
            </div>
            
            {/* Content skeleton */}
            <div className="p-6">
              {/* Title */}
              <div className="h-7 bg-neutral-200 rounded-md mb-4 w-5/6"></div>
              
              {/* Location */}
              <div className="flex items-center mb-4">
                <div className="w-5 h-5 rounded-full bg-neutral-200 mr-2"></div>
                <div className="h-4 bg-neutral-200 rounded-md w-1/2"></div>
              </div>
              
              {/* Price */}
              <div className="h-7 bg-neutral-200 rounded-md mb-6 w-1/3"></div>
              
              {/* Property features */}
              <div className="space-y-3 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-8 h-8 rounded-md bg-neutral-200 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-neutral-200 rounded-md mb-1 w-1/4"></div>
                      <div className="h-4 bg-neutral-200 rounded-md w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Button */}
              <div className="h-10 bg-neutral-200 rounded-md w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-elegant p-10 text-center my-8 max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-50 text-primary-500 rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h3 className="text-2xl font-display font-semibold text-primary-800 mb-3">{emptyMessage}</h3>
        <p className="text-neutral-600 mb-6">Try adjusting your search filters to find properties that match your criteria.</p>
        
        <div className="flex flex-wrap gap-3 justify-center text-sm text-neutral-500 max-w-md mx-auto">
          <span className="px-3 py-1 bg-neutral-100 rounded-full">Adjust location</span>
          <span className="px-3 py-1 bg-neutral-100 rounded-full">Try different flat types</span>
          <span className="px-3 py-1 bg-neutral-100 rounded-full">Change price range</span>
          <span className="px-3 py-1 bg-neutral-100 rounded-full">Reset all filters</span>
        </div>
      </div>
    );
  }

  // Display property grid
  return (
    <div className={`grid ${getGridCols()} gap-8 ${className}`}>
      {properties.map((property) => (
        <PropertyCard 
          key={property.id} 
          property={property} 
          onPropertyClick={onPropertyClick}
        />
      ))}
    </div>
  );
};

export default PropertyList; 