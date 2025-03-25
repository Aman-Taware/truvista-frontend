import React from 'react';

/**
 * Select component for dropdown selection
 * 
 * @param {Object} props
 * @param {string} props.name - Select name
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {Array} props.options - Array of options [{value, label}]
 * @param {string} props.placeholder - Optional placeholder
 * @param {string} props.status - Status for validation styling (error, success)
 * @param {string} props.helperText - Helper or error text to display
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {string} props.className - Additional classes
 */
const Select = ({
  name,
  value,
  onChange,
  options = [],
  placeholder,
  status,
  helperText,
  disabled = false,
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = "w-full px-4 py-3 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2 appearance-none";
  
  // Status-based classes
  const statusClasses = {
    default: "border-neutral-200 focus:ring-primary-500 focus:border-transparent",
    error: "border-error-500 bg-error-50 focus:ring-error-500 focus:border-transparent",
    success: "border-success-500 bg-success-50 focus:ring-success-500 focus:border-transparent",
  };

  // Text classes
  const textClasses = {
    default: "text-neutral-600",
    error: "text-error-500",
    success: "text-success-500",
  };
  
  // Disabled classes
  const stateClasses = disabled 
    ? "bg-neutral-100 cursor-not-allowed opacity-75" 
    : "bg-white";
  
  return (
    <div className="relative">
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            ${baseClasses} 
            ${statusClasses[status || 'default']} 
            ${stateClasses}
            ${className}
          `}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled hidden>{placeholder}</option>
          )}
          
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {/* Helper text or validation message */}
      {helperText && (
        <p className={`mt-1 text-sm ${textClasses[status || 'default']}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select; 