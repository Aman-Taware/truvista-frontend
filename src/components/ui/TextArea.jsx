import React from 'react';

/**
 * TextArea component for multi-line text input
 * 
 * @param {Object} props
 * @param {string} props.name - TextArea name
 * @param {string} props.value - TextArea value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - TextArea placeholder
 * @param {string} props.status - Status for validation styling (error, success)
 * @param {string} props.helperText - Helper or error text to display
 * @param {boolean} props.disabled - Whether the textarea is disabled
 * @param {boolean} props.readOnly - Whether the textarea is read-only
 * @param {number} props.rows - Number of rows to display
 * @param {string} props.className - Additional classes
 */
const TextArea = ({
  name,
  value,
  onChange,
  placeholder,
  status,
  helperText,
  disabled = false,
  readOnly = false,
  rows = 4,
  className = '',
  ...rest
}) => {
  // Base classes
  const baseClasses = "w-full px-4 py-3 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2";
  
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
  
  // Disabled/ReadOnly classes
  const stateClasses = (disabled || readOnly) 
    ? "bg-neutral-100 cursor-not-allowed opacity-75" 
    : "bg-white";
  
  return (
    <div>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        className={`
          ${baseClasses} 
          ${statusClasses[status || 'default']} 
          ${stateClasses}
          ${className}
        `}
        {...rest}
      />
      
      {/* Helper text or validation message */}
      {helperText && (
        <p className={`mt-1 text-sm ${textClasses[status || 'default']}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

export default TextArea; 