/**
 * Date utility functions for formatting and parsing dates
 */

/**
 * Formats a date string to YYYY-MM-DD format suitable for input fields
 * @param {string} dateString - The date string to format (can be ISO format)
 * @returns {string} Formatted date string in YYYY-MM-DD format
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as YYYY-MM-DD (ISO date format for input fields)
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a date to display format (e.g., '15 Jan, 2023')
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string for display
 */
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as '15 Jan, 2023'
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace(/,\s(\d{4})$/, ', $1');
  } catch (error) {
    console.error('Error formatting display date:', error);
    return '';
  }
};

/**
 * Gets a relative time string (e.g., "2 days ago", "in 3 months")
 * @param {string} dateString - The date string
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays === -1) {
      return 'Yesterday';
    } else if (diffDays > 0 && diffDays < 30) {
      return `In ${diffDays} days`;
    } else if (diffDays < 0 && diffDays > -30) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays >= 30 && diffDays < 365) {
      const months = Math.round(diffDays / 30);
      return `In ${months} ${months === 1 ? 'month' : 'months'}`;
    } else if (diffDays <= -30 && diffDays > -365) {
      const months = Math.round(Math.abs(diffDays) / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else if (diffDays >= 365) {
      const years = Math.round(diffDays / 365);
      return `In ${years} ${years === 1 ? 'year' : 'years'}`;
    } else {
      const years = Math.round(Math.abs(diffDays) / 365);
      return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
};

/**
 * Adds days to a date and returns a new date
 * @param {Date|string} date - Original date
 * @param {number} days - Number of days to add
 * @returns {Date} New date with days added
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}; 