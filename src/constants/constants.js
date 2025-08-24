/**
 * Application Constants
 * This file contains application-wide constants to maintain consistency
 */

// Locations in Pune
export const LOCATIONS = [
  'Moshi-Dudulgaon',
  'Moshi-Bohradewadi',
  'Charholi',
  'Chikhali'
];

// Flat Types
export const FLAT_TYPES = [
  '2BHK',
  '3BHK',
  '4BHK'
];

// Price Ranges (in INR)
export const PRICE_RANGES = [
  { label: '₹ 40L - 55L', min: 4000000, max: 5500000 },
  { label: '₹ 55L - 70L', min: 5500000, max: 7000000 },
  { label: '₹ 70L - 90L', min: 7000000, max: 9000000 },
  { label: '₹ 90L+', min: 9000000, max: 85000000 }
];

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED'
};

// Add booking status colors for consistent UI
export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.CONFIRMED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800'
};

// Construction Status
export const CONSTRUCTION_STATUS = [
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'NEARING_POSSESSION', label: 'Nearing Possession' }
];

// Amenities
export const AMENITIES = [
  'Swimming Pool',
  'Gym',
  'Clubhouse',
  'Park',
  'Children\'s Play Area',
  'Security',
  'Power Backup',
  'Lift',
  'Parking',
  'Visitor Parking',
  'Indoor Games',
  'Shopping Center',
  'Rainwater Harvesting',
  'Tennis Court',
  'Basketball Court',
  'Jogging Track',
  'Spa',
  'Cafe',
  'Yoga Deck',
  'Multipurpose Hall',
  'Library',
  'Movie Theatre',
  'Garden'
];

// API Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

// API Response Messages
export const API_MESSAGES = {
  AUTH_REQUIRED: 'Authentication required to access this feature',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again',
  SERVER_ERROR: 'Something went wrong. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your internet connection'
};



// Booking statuses
export const BOOKING_STATUSES = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed'
};

// User roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  AGENT: 'AGENT'
};



// Sort Options
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },

//   { value: 'area_asc', label: 'Area: Small to Large' },
//   { value: 'area_desc', label: 'Area: Large to Small' }
]; 