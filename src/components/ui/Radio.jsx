import React from 'react';

/**
 * Radio component
 * 
 * @param {Object} props
 * @param {string} props.name - Radio button name (group name)
 * @param {string|number} props.value - Radio button value
 * @param {string|number} props.checkedValue - Currently selected value in the group
 * @param {Function} props.onChange - Change handler
 * @param {string} props.label - Label text
 * @param {string} props.status - Status for validation styling (error, success)
 * @param {string} props.helperText - Helper or error text to display
 * @param {boolean} props.disabled - Whether the radio is disabled
 * @param {string} props.className - Additional classes for the container
 */
const Radio = ({
  name,
  value,
  checkedValue,
  onChange,
  label,
  status,
  helperText,
  disabled = false,
  className = '',
  ...rest
}) => {
  // Check if this radio is selected
  const isChecked = value === checkedValue;
  
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
          {/* Hidden actual radio for accessibility */}
          <input
            type="radio"
            name={name}
            value={value}
            checked={isChecked}
            onChange={onChange}
            disabled={disabled}
            className="absolute w-0 h-0 opacity-0"
            {...rest}
          />
          
          {/* Custom styled radio */}
          <div 
            className={`
              w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors
              ${isChecked 
                ? 'border-primary-600' 
                : 'border-neutral-300'}
              ${disabled ? 'opacity-50' : ''}
              ${status === 'error' ? 'border-error-500' : ''}
              ${status === 'success' ? 'border-success-500' : ''}
            `}
          >
            {isChecked && (
              <div 
                className={`
                  w-2.5 h-2.5 rounded-full 
                  ${status === 'error' ? 'bg-error-500' : ''}
                  ${status === 'success' ? 'bg-success-500' : ''}
                  ${!status ? 'bg-primary-600' : ''}
                `} 
              />
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

export default Radio; 