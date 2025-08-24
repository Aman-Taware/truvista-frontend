import React from 'react';

/**
 * Button component with multiple variants
 * 
 * @param {Object} props
 * @param {string} props.variant - Button style variant: 'primary', 'secondary', 'outline', 'ghost'
 * @param {string} props.size - Button size: 'xs', 'sm', 'md', 'lg'
 * @param {boolean} props.fullWidth - Whether the button should take full width
 * @param {boolean} props.isLoading - Whether the button is in loading state
 * @param {React.ReactNode} props.children - Button content
 * @param {string} props.className - Additional classes to apply
 * @param {React.ElementType} props.as - Component to render as (Link, button, etc)
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  children,
  className = '',
  startIcon,
  endIcon,
  type = 'button',
  as: Component = 'button',
  ...rest
}) => {
  // Base classes
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-md relative overflow-hidden";
  
  // Size classes
  const sizeClasses = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-sm md:text-base",
    lg: "px-8 py-4 text-base md:text-lg"
  };
  
  // Variant classes
  const variantClasses = {
    primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary-300 focus:ring-offset-2",
    secondary: "bg-secondary-500 text-primary-800 hover:bg-secondary-600 active:bg-secondary-700 shadow-md hover:shadow-lg focus:ring-2 focus:ring-secondary-300 focus:ring-offset-2",
    outline: "border-2 border-primary-500 text-primary-500 bg-transparent hover:bg-primary-50 focus:ring-2 focus:ring-primary-200 focus:ring-offset-2",
    ghost: "text-primary-500 bg-transparent hover:bg-neutral-100 focus:ring-2 focus:ring-primary-100",
    danger: "bg-error-500 text-white hover:bg-error-600 shadow-md hover:shadow-lg focus:ring-2 focus:ring-error-300 focus:ring-offset-2"
  };
  
  // Loading and disabled states
  const stateClasses = (disabled || isLoading) ? "opacity-70 cursor-not-allowed" : "cursor-pointer";
  
  // Full width class
  const widthClass = fullWidth ? "w-full" : "";
  
  return (
    <Component
      type={Component === 'button' ? type : undefined}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${stateClasses} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <svg 
            className="animate-spin h-5 w-5 text-current" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}
      
      <span className={isLoading ? 'opacity-0' : ''}>
        {startIcon && !isLoading && (
          <span className="mr-2">{startIcon}</span>
        )}
        
        {children}
        
        {endIcon && (
          <span className="ml-2">{endIcon}</span>
        )}
      </span>
    </Component>
  );
};

export default Button; 