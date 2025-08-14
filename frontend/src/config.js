// Configuration for different environments
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
const isDev = process.env.NODE_ENV === 'development' || isLocalhost;

// Get the current hostname
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

// Determine the base URL for API requests
let API_BASE_URL = '';

if (isDev) {
  // In development, use the proxy set in package.json
  API_BASE_URL = '';
} else if (hostname.includes('vercel.app')) {
  // If this is the separate frontend deployment, point to the backend project domain to avoid 404s.
  if (hostname.startsWith('realtor-clone-react-4ziu')) {
    API_BASE_URL = 'https://realtor-clone-react.vercel.app';
  } else {
    // Otherwise prefer same-origin
    API_BASE_URL = '';
  }
}
// For production on the same domain, use relative URLs (empty string)

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
