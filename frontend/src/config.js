// Configuration for different environments
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const isDev = process.env.NODE_ENV === 'development' || isLocalhost;

// For production, use relative URLs since both frontend and backend are on the same domain
const API_BASE_URL = isDev ? '' : '';

// If you need to use a different domain for API in production, uncomment and set this:
// const API_BASE_URL = isDev ? '' : 'https://realtor-clone-react-4ziu.vercel.app';

const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  LISTINGS: {
    BASE: '/api/listings',
    SLIDER: '/api/listings/slider',
  },
  CONTACT: '/api/contact',
};

// Add base URL to all endpoints
const addBaseUrl = (endpoints, baseUrl) => {
  const result = {};
  for (const [key, value] of Object.entries(endpoints)) {
    if (typeof value === 'object') {
      result[key] = addBaseUrl(value, baseUrl);
    } else {
      result[key] = baseUrl + value;
    }
  }
  return result;
};

export const API_ENDPOINTS = addBaseUrl(ENDPOINTS, API_BASE_URL);

// Log the configuration for debugging
console.log('Environment:', isDev ? 'development' : 'production');
console.log('API Base URL:', API_BASE_URL || '(using relative URLs)');
console.log('API Endpoints:', API_ENDPOINTS);
