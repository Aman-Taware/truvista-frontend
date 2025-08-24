import React from 'react';

/**
 * Pagination component for navigating through pages
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current active page (1-based)
 * @param {number} props.totalPages - Total number of pages
 * @param {Function} props.onPageChange - Function called when page changes
 * @param {number} props.showPages - Number of page buttons to show
 * @param {boolean} props.showFirstLast - Whether to show first/last page buttons
 * @param {string} props.variant - Style variant: 'default', 'minimal'
 * @param {string} props.size - Size of pagination: 'sm', 'md', 'lg'
 * @param {string} props.className - Additional CSS classes
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPages = 5,
  showFirstLast = true,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  // Don't render if only one page
  if (totalPages <= 1) return null;
  
  // Ensure currentPage is valid
  const page = Math.max(1, Math.min(currentPage, totalPages));
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPageChange(newPage);
    }
  };
  
  // Calculate which page buttons to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const halfShow = Math.floor(showPages / 2);
    
    let startPage = Math.max(1, page - halfShow);
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };
  
  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };
  
  // Variant classes
  const getVariantClasses = (isActive) => {
    switch (variant) {
      case 'minimal':
        return isActive
          ? 'bg-primary-100 text-primary-800 font-semibold'
          : 'text-neutral-600 hover:bg-neutral-100';
      default: // default variant
        return isActive
          ? 'bg-primary-600 text-white border-primary-600 font-semibold'
          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300';
    }
  };
  
  // Determine if Previous/Next buttons should be disabled
  const isPrevDisabled = page === 1;
  const isNextDisabled = page === totalPages;
  
  const pageNumbers = getPageNumbers();
  
  return (
    <nav 
      role="navigation" 
      aria-label="Pagination"
      className={`flex items-center justify-center ${className}`}
    >
      <ul className="flex items-center space-x-1">
        {/* First Page Button */}
        {showFirstLast && (
          <li>
            <PaginationButton
              onClick={() => handlePageChange(1)}
              disabled={isPrevDisabled}
              aria-label="Go to first page"
              size={size}
              variant={variant}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </PaginationButton>
          </li>
        )}
        
        {/* Previous Button */}
        <li>
          <PaginationButton
            onClick={() => handlePageChange(page - 1)}
            disabled={isPrevDisabled}
            aria-label="Go to previous page"
            size={size}
            variant={variant}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </PaginationButton>
        </li>
        
        {/* Page Numbers */}
        {pageNumbers.map((pageNumber) => (
          <li key={pageNumber}>
            <PaginationButton
              onClick={() => handlePageChange(pageNumber)}
              active={pageNumber === page}
              size={size}
              variant={variant}
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === page ? 'page' : undefined}
            >
              {pageNumber}
            </PaginationButton>
          </li>
        ))}
        
        {/* Next Button */}
        <li>
          <PaginationButton
            onClick={() => handlePageChange(page + 1)}
            disabled={isNextDisabled}
            aria-label="Go to next page"
            size={size}
            variant={variant}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </PaginationButton>
        </li>
        
        {/* Last Page Button */}
        {showFirstLast && (
          <li>
            <PaginationButton
              onClick={() => handlePageChange(totalPages)}
              disabled={isNextDisabled}
              aria-label="Go to last page"
              size={size}
              variant={variant}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0zm6 0a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </PaginationButton>
          </li>
        )}
      </ul>
    </nav>
  );
};

// Helper pagination button component
const PaginationButton = ({
  children,
  onClick,
  active = false,
  disabled = false,
  size = 'md',
  variant = 'default',
  ...rest
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
  };
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        if (disabled) return 'text-neutral-300 cursor-not-allowed';
        return active
          ? 'bg-primary-100 text-primary-800 font-semibold'
          : 'text-neutral-600 hover:bg-neutral-100';
      default: // default variant
        if (disabled) return 'text-neutral-300 border border-neutral-200 cursor-not-allowed';
        return active
          ? 'bg-primary-600 text-white border border-primary-600 font-semibold'
          : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300';
    }
  };
  
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      className={`
        flex items-center justify-center rounded
        transition-colors duration-200
        ${sizeClasses[size]}
        ${getVariantClasses()}
      `}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Pagination; 