import React from 'react';

/**
 * Logo Component
 * Renders the Truvista logo with support for light and dark variants
 * 
 * @param {Object} props
 * @param {string} props.variant - 'light' for white text on dark backgrounds, 'dark' for dark text on light backgrounds
 * @param {string} props.className - Additional classes for the logo container
 * @param {boolean} props.withTagline - Whether to show the tagline
 * @returns {JSX.Element} Logo component
 */
const Logo = ({ variant = 'dark', className = '', withTagline = false }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-primary-800';
  const accentColor = variant === 'light' ? 'text-secondary-300' : 'text-secondary-500';
  
  return (
    <div className={`font-display ${className}`}>
      <div className="flex items-center">
        <img 
          src="/logo.png" 
          alt="Truvista Logo" 
          className="h-8 md:h-10 mr-2"
        />
        <span className={`text-2xl md:text-3xl font-bold ${textColor}`}>
          Truvista
        </span>
        <span className={`text-2xl md:text-3xl font-bold ${accentColor}`}>.</span>
      </div>
      
      {withTagline && (
        <p className={`text-xs tracking-wide mt-1 ${variant === 'light' ? 'text-white/80' : 'text-primary-600'}`}>
          LUXURY REAL ESTATE
        </p>
      )}
    </div>
  );
};

export default Logo; 