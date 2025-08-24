import React, { useState, useRef, useEffect } from 'react';

/**
 * Accordion component for collapsible content
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of items with title and content
 * @param {string} props.defaultOpen - Index or array of indices to open by default
 * @param {boolean} props.allowMultiple - Whether multiple panels can be open at once
 * @param {string} props.variant - Style variant: 'default', 'bordered', 'minimal'
 * @param {string} props.className - Additional classes
 */
const Accordion = ({
  items = [],
  defaultOpen,
  allowMultiple = false,
  variant = 'default',
  className = '',
}) => {
  // Initialize open state
  const [openItems, setOpenItems] = useState(() => {
    if (defaultOpen === undefined) {
      return allowMultiple ? [] : null;
    }
    
    if (allowMultiple) {
      return Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen];
    }
    
    return defaultOpen;
  });
  
  // Toggle an accordion item
  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems((prevItems) => 
        prevItems.includes(index)
          ? prevItems.filter(i => i !== index)
          : [...prevItems, index]
      );
    } else {
      setOpenItems(openItems === index ? null : index);
    }
  };
  
  // Check if an item is open
  const isItemOpen = (index) => {
    if (allowMultiple) {
      return openItems.includes(index);
    }
    return openItems === index;
  };
  
  // Variant classes for the accordion container
  const getContainerVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-200';
      case 'minimal':
        return 'divide-y divide-neutral-200';
      default: // default variant
        return 'divide-y divide-neutral-200 border border-neutral-200 rounded-lg overflow-hidden';
    }
  };
  
  return (
    <div className={`${getContainerVariantClasses()} ${className}`}>
      {items.map((item, index) => (
        <AccordionItem
          key={index}
          title={item.title}
          index={index}
          isOpen={isItemOpen(index)}
          onToggle={() => toggleItem(index)}
          variant={variant}
        >
          {item.content}
        </AccordionItem>
      ))}
    </div>
  );
};

/**
 * Individual accordion item component
 */
const AccordionItem = ({
  title,
  children,
  index,
  isOpen,
  onToggle,
  variant,
}) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  
  // Update height when content changes or on resize
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
    
    const handleResize = () => {
      if (isOpen && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, children]);
  
  // Variant classes for the accordion button
  const getButtonVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'bg-white hover:bg-neutral-50';
      case 'minimal':
        return 'bg-transparent hover:bg-neutral-50 px-0';
      default: // default variant
        return 'bg-white hover:bg-neutral-50';
    }
  };
  
  // Variant classes for the accordion content
  const getContentVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'px-0';
      default: // Any other variant
        return '';
    }
  };
  
  return (
    <div className="accordion-item">
      <h3>
        <button
          type="button"
          className={`
            w-full flex items-center justify-between py-4 px-6 text-left font-medium 
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            transition-colors duration-200
            ${getButtonVariantClasses()}
          `}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`accordion-content-${index}`}
        >
          <span className="text-neutral-800">{title}</span>
          <span className="ml-4 flex-shrink-0">
            <svg
              className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={`accordion-content-${index}`}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${getContentVariantClasses()}`}
        style={{ maxHeight: `${height}px` }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="py-4 px-6 text-neutral-700">
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Standalone Accordion.Item component for custom usage
 */
Accordion.Item = ({
  title,
  children,
  isOpen = false,
  onToggle,
  variant = 'default',
  className = '',
}) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);
  const uniqueId = useRef(`accordion-${Math.random().toString(36).substring(2, 9)}`);
  
  // Update height when content changes or on resize
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
    
    const handleResize = () => {
      if (isOpen && contentRef.current) {
        setHeight(contentRef.current.scrollHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, children]);
  
  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'bordered':
        return 'border border-neutral-200 rounded-lg overflow-hidden';
      case 'minimal':
        return '';
      default: // default variant
        return 'border border-neutral-200 rounded-lg overflow-hidden';
    }
  };
  
  return (
    <div className={`accordion-item ${getVariantClasses()} ${className}`}>
      <h3>
        <button
          type="button"
          className={`
            w-full flex items-center justify-between py-4 px-6 text-left font-medium
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
            ${isOpen ? 'bg-neutral-50' : 'bg-white hover:bg-neutral-50'}
            transition-colors duration-200
          `}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={uniqueId.current}
        >
          <span className="text-neutral-800">{title}</span>
          <span className="ml-4 flex-shrink-0">
            <svg
              className={`w-5 h-5 text-neutral-500 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>
      </h3>
      <div
        id={uniqueId.current}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: `${height}px` }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="py-4 px-6 text-neutral-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Accordion; 