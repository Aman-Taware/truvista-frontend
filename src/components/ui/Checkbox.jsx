import React from 'react';

/**
 * Checkbox component 
 * 
 * @param {Object} props
 * @param {string} props.name - Checkbox name
 * @param {boolean} props.checked - Whether the checkbox is checked
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text
 * @param {string} props.status - Status for validation styling (error, success)
 * @param {string} props.helperText - Helper or error text to display
 * @param {boolean} props.disabled - Whether the checkbox is disabled
 * @param {string} props.className - Additional classes for the container
 */
const Checkbox = ({
  name,
  checked,
  onChange,
  label,
  status,
  helperText,
  disabled = false,
  className = '',
  ...rest
}) => {
  // Text classes based on status
  const textClasses = {
    default: "text-neutral-600",
    error: "text-error-500",
    success: "text-success-500",
  };
  
  // Disabled state styling
  const disabledClasses = disabled
    ? "opacity-60 cursor-not-allowed"
    : "cursor-pointer";
  
  return (
    <div className={`${className}`}>
      <label className={`inline-flex items-center ${disabledClasses}`}>
        <div className="relative flex items-center">
          {/* Hidden actual checkbox for accessibility */}
          <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="absolute w-0 h-0 opacity-0"
            {...rest}
          />
          
          {/* Custom styled checkbox */}
          <div 
            className={`
              w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors
              ${checked 
                ? 'bg-primary-600 border-primary-600' 
                : 'bg-white border-neutral-300'}
              ${disabled ? 'opacity-50' : ''}
              ${status === 'error' ? 'border-error-500' : ''}
              ${status === 'success' ? 'border-success-500' : ''}
            `}
          >
            {checked && (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-3.5 w-3.5 text-white" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
          </div>
        </div>
        
        {/* Label */}
        {label && <span className="text-sm">{label}</span>}
      </label>
      
      {/* Helper text or validation message */}
      {helperText && (
        <p className={`mt-1 text-sm ${textClasses[status || 'default']} ml-8`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Checkbox; 