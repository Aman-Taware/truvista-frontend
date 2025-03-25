import React from 'react';

/**
 * FormGroup component - Container for form inputs with labels
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The form input component
 * @param {string} props.label - Label text for the input
 * @param {string} props.htmlFor - ID of the input (for accessibility)
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.className - Additional classes
 * @param {string} props.description - Optional description text that appears below the label
 * @param {string} props.labelClassName - Additional classes for the label
 */
const FormGroup = ({
  children,
  label,
  htmlFor,
  required = false,
  className = '',
  description,
  labelClassName = '',
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <div className="mb-2">
          <label 
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-neutral-800 ${labelClassName}`}
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
          
          {description && (
            <p className="mt-1 text-xs text-neutral-500">{description}</p>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
};

export default FormGroup; 