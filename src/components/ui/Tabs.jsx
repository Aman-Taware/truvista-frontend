import React, { useState, useEffect } from 'react';

/**
 * Tabs component for organizing content
 * 
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with label and optional icon
 * @param {number} props.activeTab - Index of the active tab
 * @param {Function} props.onChange - Function to call when tab is changed
 * @param {string} props.variant - Tab style variant: 'default', 'pills', 'underline'
 * @param {boolean} props.fullWidth - Whether tabs should take full width
 * @param {string} props.className - Additional classes
 * @param {string} props.tabClassName - Additional classes for individual tabs
 */
const Tabs = ({
  tabs = [],
  activeTab: controlledActiveTab,
  onChange,
  variant = 'default',
  fullWidth = false,
  className = '',
  tabClassName = '',
}) => {
  // State for uncontrolled usage
  const [internalActiveTab, setInternalActiveTab] = useState(0);
  
  // Determine if component is controlled or uncontrolled
  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;
  
  // Sync with controlled prop
  useEffect(() => {
    if (isControlled && controlledActiveTab !== internalActiveTab) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab, isControlled, internalActiveTab]);
  
  // Handle tab change
  const handleTabChange = (index) => {
    if (!isControlled) {
      setInternalActiveTab(index);
    }
    if (onChange) {
      onChange(index);
    }
  };
  
  // Variant classes
  const getVariantClasses = (index) => {
    const isActive = index === activeTab;
    
    switch (variant) {
      case 'pills':
        return isActive 
          ? 'bg-primary-600 text-white' 
          : 'text-neutral-600 hover:text-primary-700 hover:bg-primary-50';
      case 'underline':
        return isActive 
          ? 'text-primary-700 border-b-2 border-primary-600' 
          : 'text-neutral-600 hover:text-primary-700 border-b-2 border-transparent';
      default: // default variant
        return isActive 
          ? 'text-primary-700 bg-white border-t border-l border-r border-neutral-200 rounded-t-md -mb-px' 
          : 'text-neutral-600 hover:text-primary-700 border border-transparent';
    }
  };
  
  // Container classes based on variant
  const getContainerClasses = () => {
    switch (variant) {
      case 'pills':
        return 'p-1 bg-neutral-100 rounded-md';
      case 'underline':
        return 'border-b border-neutral-200';
      default: // default variant
        return 'border-b border-neutral-200';
    }
  };
  
  return (
    <div className={className}>
      {/* Tab Navigation */}
      <div className={`flex ${fullWidth ? 'w-full' : ''} ${getContainerClasses()}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`
              flex items-center px-4 py-2 font-medium transition-all duration-200
              ${fullWidth ? 'flex-1 justify-center' : ''}
              ${getVariantClasses(index)}
              ${tabClassName}
            `}
            onClick={() => handleTabChange(index)}
            aria-selected={index === activeTab}
            role="tab"
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * TabPanel component to render tab content
 */
export const TabPanel = ({ children, isActive, className = '', ...rest }) => {
  if (!isActive) return null;
  
  return (
    <div 
      role="tabpanel"
      className={`py-4 focus:outline-none ${className}`}
      tabIndex={0}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * TabPanels component to contain and manage multiple tab panels
 */
export const TabPanels = ({ children, activeTab = 0, className = '', ...rest }) => {
  // Filter out non-element children like null, undefined, etc.
  const validChildren = React.Children.toArray(children).filter(
    child => React.isValidElement(child)
  );
  
  return (
    <div className={className} {...rest}>
      {React.Children.map(validChildren, (child, index) => 
        React.cloneElement(child, { isActive: index === activeTab })
      )}
    </div>
  );
};

export default Tabs; 