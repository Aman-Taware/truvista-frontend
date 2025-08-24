import React from 'react';

/**
 * Container component for consistent layout spacing
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} props.className - Additional classes to apply
 * @param {boolean} props.fluid - Whether the container should be full-width
 * @param {string} props.as - HTML element to render as
 * @param {string} props.background - Background color: 'default', 'cream', 'dark', 'primary', 'secondary'
 */
const Container = ({
  children,
  className = '',
  fluid = false,
  as: Component = 'div',
  background = 'default',
  ...rest
}) => {
  // Background classes
  const backgroundClasses = {
    default: '',
    cream: 'bg-neutral-50',
    dark: 'bg-primary-800 text-white',
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-secondary-500'
  };

  return (
    <Component
      className={`mx-auto px-4 sm:px-6 md:px-8 ${
        fluid ? 'w-full' : 'max-w-7xl'
      } ${backgroundClasses[background]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * Section component with consistent vertical spacing
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be wrapped
 * @param {string} props.className - Additional classes to apply
 * @param {string} props.as - HTML element to render as
 * @param {string} props.background - Background color: 'default', 'cream', 'dark', 'primary', 'secondary'
 */
export const Section = ({
  children,
  className = '',
  as: Component = 'section',
  background = 'default',
  ...rest
}) => {
  // Background classes
  const backgroundClasses = {
    default: '',
    cream: 'bg-neutral-50',
    dark: 'bg-primary-800 text-white',
    primary: 'bg-primary-500 text-white',
    secondary: 'bg-secondary-500 text-primary-800'
  };
  
  return (
    <Component
      className={`py-12 md:py-16 lg:py-20 ${backgroundClasses[background]} ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * Section header with title and optional subtitle
 * 
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.subtitle - Optional section subtitle
 * @param {boolean} props.centered - Whether to center the header text
 * @param {string} props.className - Additional classes to apply
 * @param {string} props.theme - Color theme: 'light', 'dark'
 */
export const SectionHeader = ({
  title,
  subtitle,
  centered = false,
  className = '',
  theme = 'light',
}) => {
  // Title and subtitle color based on theme
  const titleColorClass = theme === 'dark' ? 'text-white' : 'text-primary-800';
  const subtitleColorClass = theme === 'dark' ? 'text-white/80' : 'text-neutral-700';
  
  return (
    <div className={`mb-8 md:mb-10 lg:mb-12 ${centered ? 'text-center' : ''} ${className}`}>
      <h2 className={`text-3xl md:text-4xl font-display font-semibold mb-4 ${titleColorClass}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-lg max-w-3xl ${subtitleColorClass} ${centered ? 'mx-auto' : ''}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default Container; 