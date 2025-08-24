import React from 'react';

/**
 * Input component
 * 
 * @param {Object} props
 * @param {string} props.type - Input type (text, email, password, etc)
 * @param {string} props.name - Input name
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Input placeholder
 * @param {string} props.status - Status for validation styling (error, success)
 * @param {string} props.helperText - Helper or error text to display
 * @param {React.ReactNode} props.startIcon - Icon to display at the start
 * @param {React.ReactNode} props.endIcon - Icon to display at the end
 * @param {boolean} props.disabled - Whether the input is disabled
 * @param {boolean} props.readOnly - Whether the input is read-only
 * @param {string} props.className - Additional classes
 */
const Input = ({
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  status,
  helperText,
  startIcon,
  endIcon,
  disabled = false,
  readOnly = false,
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
  
  // Padding adjustment if icons are present
  const paddingClasses = startIcon 
    ? "pl-10" 
    : (endIcon ? "pr-10" : "");
  
  return (
    <div className="relative">
      {/* Input with icon positioning adjustments */}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`
          ${baseClasses} 
          ${statusClasses[status || 'default']} 
          ${stateClasses}
          ${paddingClasses}
          ${className}
        `}
        {...rest}
      />
      
      {/* Start icon */}
      {startIcon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
          {startIcon}
        </div>
      )}
      
      {/* End icon */}
      {endIcon && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
          {endIcon}
        </div>
      )}
      
      {/* Helper text or validation message */}
      {helperText && (
        <p className={`mt-1 text-sm ${textClasses[status || 'default']}`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

/**
 * TextArea component with validation states
 */
export const TextArea = ({
  label,
  error,
  helperText,
  required = false,
  id,
  rows = 4,
  className = '',
  ...rest
}) => {
  // Generate an ID if none is provided
  const textareaId = id || `textarea-${Math.random().toString(36).substring(2, 9)}`;
  
  // Determine textarea state classes
  const getStateClasses = () => {
    if (error) {
      return 'border-error-500 focus:ring-error-500/50 focus:border-error-500';
    }
    return 'border-neutral-200 focus:ring-primary-500/50 focus:border-primary-500';
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={textareaId}
        rows={rows}
        className={`w-full px-4 py-3 rounded-md transition-all duration-200 
          ${getStateClasses()}
          focus:outline-none focus:ring-2 focus:ring-offset-0`}
        aria-invalid={error ? 'true' : 'false'}
        {...rest}
      />
      
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

/**
 * Select component with validation states
 */
export const Select = ({
  label,
  error,
  helperText,
  required = false,
  id,
  options = [],
  className = '',
  ...rest
}) => {
  // Generate an ID if none is provided
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  // Determine select state classes
  const getStateClasses = () => {
    if (error) {
      return 'border-error-500 focus:ring-error-500/50 focus:border-error-500';
    }
    return 'border-neutral-200 focus:ring-primary-500/50 focus:border-primary-500';
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={`w-full px-4 py-3 rounded-md transition-all duration-200 
          ${getStateClasses()}
          focus:outline-none focus:ring-2 focus:ring-offset-0
          appearance-none bg-white`}
        aria-invalid={error ? 'true' : 'false'}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
    </div>
  );
};

/**
 * MultiSelect component with validation states
 * Allows selecting multiple options with checkboxes
 */
export const MultiSelect = ({
  label,
  error,
  helperText,
  required = false,
  id,
  options = [],
  value = '',
  onChange,
  className = '',
  ...rest
}) => {
  // Generate an ID if none is provided
  const selectId = id || `multi-select-${Math.random().toString(36).substring(2, 9)}`;
  
  // Parse the comma-separated value to an array
  const selectedValues = value ? value.split(',').map(v => v.trim()) : [];
  
  // Determine state classes
  const getStateClasses = () => {
    if (error) {
      return 'border-error-500 focus:ring-error-500/50 focus:border-error-500';
    }
    return 'border-neutral-200 focus:ring-primary-500/50 focus:border-primary-500';
  };
  
  // Handle toggle of a checkbox
  const handleToggle = (optionValue) => {
    const isSelected = selectedValues.includes(optionValue);
    let newSelected;
    
    if (isSelected) {
      // Remove from selection
      newSelected = selectedValues.filter(val => val !== optionValue);
    } else {
      // Add to selection
      newSelected = [...selectedValues, optionValue];
    }
    
    // Convert back to comma-separated string and trigger onChange
    onChange({
      target: {
        value: newSelected.join(',')
      }
    });
  };
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div 
        className={`w-full rounded-md transition-all duration-200 border divide-y
          ${getStateClasses()}
          focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500`}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center px-4 py-2 hover:bg-gray-50">
            <input
              type="checkbox"
              id={`${selectId}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label 
              htmlFor={`${selectId}-${option.value}`}
              className="ml-3 block text-sm text-gray-700 select-none cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helperText}</p>
      )}
      
      {selectedValues.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedValues.map((val) => {
            const option = options.find(opt => opt.value === val);
            return option ? (
              <span key={val} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {option.label}
                <button
                  type="button"
                  onClick={() => handleToggle(val)}
                  className="ml-1 text-primary-600 hover:text-primary-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default Input; 