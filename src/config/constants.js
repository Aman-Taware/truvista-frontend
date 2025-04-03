/**
 * API Configuration Constants
 * This file contains API-related configuration constants
 */

// API base URL - adjust based on environment
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://app.truvista.in'
  : 'http://localhost:8080';

// API request timeout in milliseconds
export const API_TIMEOUT = 30000;

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest'
};

// API versioning
export const API_VERSION = 'v1'; 