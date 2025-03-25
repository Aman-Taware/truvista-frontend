import React from 'react';

/**
 * Card component with multiple variants
 * 
 * @param {Object} props
 * @param {string} props.variant - Card style variant: 'default', 'elegant', 'outline', 'property'
 * @param {boolean} props.hover - Enable hover effects
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes to apply
 */
const Card = ({
  variant = 'default',
  hover = true,
  children,
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = "bg-white overflow-hidden";
  
  // Variant classes
  const variantClasses = {
    default: "rounded-lg shadow-md border border-neutral-200",
    elegant: "rounded-xl shadow-elegant border border-neutral-100 p-6",
    outline: "rounded-lg border-2 border-neutral-200",
    flat: "rounded-lg border border-neutral-200",
    property: "rounded-lg shadow-card border border-neutral-200"
  };
  
  // Hover classes based on variant
  const getHoverClasses = () => {
    if (!hover) return "";
    
    switch (variant) {
      case 'property':
        return "transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1";
      default:
        return "transition-shadow duration-300 hover:shadow-lg";
    }
  };
  
  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${getHoverClasses()} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Card.Header component for consistent card headers
 */
Card.Header = ({
  children,
  className = '',
  divided = false,
  ...rest
}) => {
  const dividerClass = divided ? "border-b border-neutral-200 pb-4 mb-4" : "";
  
  return (
    <div className={`${dividerClass} ${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card.Body component for card content
 */
Card.Body = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div className={`${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card.Footer component for card actions
 */
Card.Footer = ({
  children,
  className = '',
  divided = false,
  ...rest
}) => {
  const dividerClass = divided ? "border-t border-neutral-200 pt-4 mt-4" : "";
  
  return (
    <div className={`${dividerClass} ${className}`} {...rest}>
      {children}
    </div>
  );
};

/**
 * Card.Image component for card media
 */
Card.Image = ({
  src,
  alt = '',
  className = '',
  overlay = false,
  ...rest
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`} {...rest}>
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-primary-800/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </div>
  );
};

/**
 * Card.Badge component for status indicators
 */
Card.Badge = ({
  children,
  variant = 'primary',
  className = '',
  ...rest
}) => {
  const variantClasses = {
    primary: "bg-primary-100 text-primary-800",
    secondary: "bg-secondary-100 text-primary-800",
    success: "bg-success-100 text-success-800",
    error: "bg-error-100 text-error-800"
  };
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Card; 