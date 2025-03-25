/**
 * Format utility functions for displaying numbers, prices, and dates
 */

/**
 * Formats a number to a price string with Indian currency format
 * e.g., 5000000 -> ₹ 50L, 15000000 -> ₹ 1.5Cr
 * 
 * @param {number} amount - The amount to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount) => {
  if (!amount && amount !== 0) return '';
  
  try {
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Format in Indian currency style
    if (numAmount >= 10000000) {
      // Convert to crores (1Cr = 10M)
      return `₹ ${(numAmount / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
    } else if (numAmount >= 100000) {
      // Convert to lakhs (1L = 100K)
      return `₹ ${(numAmount / 100000).toFixed(1).replace(/\.0$/, '')}L`;
    } else if (numAmount >= 1000) {
      // Convert to thousands
      return `₹ ${(numAmount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    } else {
      return `₹ ${numAmount}`;
    }
  } catch (error) {
    console.error('Error formatting price:', error);
    return '₹ --';
  }
};

/**
 * Formats a number with commas as thousands separators in Indian format
 * e.g., 1234567 -> 12,34,567
 * 
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumberIndian = (number) => {
  if (!number && number !== 0) return '';
  
  try {
    // Convert to string and remove any existing commas
    const numStr = number.toString().replace(/,/g, '');
    
    // Split number into integer and decimal parts
    const parts = numStr.split('.');
    const integerPart = parts[0];
    
    // Format integer part with commas (Indian format: 12,34,567)
    let formattedInt = '';
    const length = integerPart.length;
    
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        formattedInt = integerPart.charAt(length - 1 - i);
      } else if (i === 3) {
        formattedInt = integerPart.charAt(length - 1 - i) + ',' + formattedInt;
      } else if (i > 3 && (i - 3) % 2 === 0) {
        formattedInt = integerPart.charAt(length - 1 - i) + ',' + formattedInt;
      } else {
        formattedInt = integerPart.charAt(length - 1 - i) + formattedInt;
      }
    }
    
    // Add decimal part if exists
    if (parts.length > 1) {
      formattedInt += '.' + parts[1];
    }
    
    return formattedInt;
  } catch (error) {
    console.error('Error formatting number:', error);
    return number.toString();
  }
};

/**
 * Formats a date string to a display format (e.g., 15 Jan, 2023)
 * 
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as '15 Jan, 2023'
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace(/,\s(\d{4})$/, ', $1');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats an area value with unit
 * 
 * @param {number} area - The area value
 * @param {string} unit - The area unit (default: 'sq.ft.')
 * @returns {string} Formatted area string
 */
export const formatArea = (area, unit = 'sq.ft.') => {
  if (!area && area !== 0) return '';
  
  try {
    return `${formatNumberIndian(area)} ${unit}`;
  } catch (error) {
    console.error('Error formatting area:', error);
    return '';
  }
};

/**
 * Formats a price range with min and max values
 * 
 * @param {number} minPrice - The minimum price
 * @param {number} maxPrice - The maximum price
 * @param {string} currency - The currency code (default: 'INR')
 * @param {string} locale - The locale to use for formatting (default: 'en-IN')
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice, currency = 'INR', locale = 'en-IN') => {
  if (minPrice === undefined && maxPrice === undefined) {
    return 'Price on Request';
  }

  if (minPrice === undefined || minPrice === null) {
    return `Up to ${formatPrice(maxPrice, currency, locale)}`;
  }

  if (maxPrice === undefined || maxPrice === null) {
    return `From ${formatPrice(minPrice, currency, locale)}`;
  }

  // If min and max prices are the same
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency, locale);
  }

  return `${formatPrice(minPrice, currency, locale)} - ${formatPrice(maxPrice, currency, locale)}`;
}; 