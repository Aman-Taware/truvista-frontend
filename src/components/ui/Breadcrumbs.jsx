import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumbs component for page navigation
 * 
 * @param {Object} props
 * @param {Array} props.items - Array of breadcrumb items with label and to props
 * @param {string} props.separator - Character or element to separate items
 * @param {string} props.className - Additional classes
 * @param {boolean} props.showHome - Whether to show home icon at the beginning
 */
const Breadcrumbs = ({
  items = [],
  separator = '/',
  className = '',
  showHome = true,
}) => {
  // Home breadcrumb item
  const homeItem = {
    label: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    to: '/',
  };

  // Full breadcrumb list
  const allItems = showHome ? [homeItem, ...items] : items;

  return (
    <nav aria-label="Breadcrumb" className={`mb-4 ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-neutral-400">
                  {typeof separator === 'string' ? separator : separator}
                </span>
              )}
              
              {isLast ? (
                <span 
                  className="text-neutral-800 font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

/**
 * Breadcrumb.Item component for custom usage
 */
Breadcrumbs.Item = ({
  label,
  to,
  isActive = false,
}) => {
  if (isActive) {
    return (
      <span 
        className="text-neutral-800 font-medium"
        aria-current="page"
      >
        {label}
      </span>
    );
  }
  
  return (
    <Link
      to={to}
      className="text-primary-600 hover:text-primary-700 transition-colors duration-200"
    >
      {label}
    </Link>
  );
};

/**
 * Helper function to generate breadcrumbs from a path
 * 
 * @param {string} path - Current path 
 * @param {Object} routeMap - Map of routes to breadcrumb labels
 * @returns {Array} Array of breadcrumb items
 */
export const generateBreadcrumbs = (path, routeMap = {}) => {
  // Split the path into segments
  const segments = path.split('/').filter(Boolean);
  
  // Generate breadcrumb items
  return segments.map((segment, index) => {
    // Build the path up to this segment
    const to = `/${segments.slice(0, index + 1).join('/')}`;
    
    // Get the label from the route map or capitalize the segment
    let label = routeMap[to] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Handle dynamic segments (those with params, like :id)
    if (segment.match(/^\d+$/) && routeMap.dynamic) {
      label = routeMap.dynamic.replace(':id', segment);
    }
    
    return { label, to };
  });
};

export default Breadcrumbs; 