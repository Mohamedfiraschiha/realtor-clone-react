// Configuration for different environments
const config = {
  development: {
    API_BASE_URL: '' // Empty string will use relative URLs in development
  },
  production: {
    API_BASE_URL: 'https://realtor-clone-react-4ziu-fdely25nb-firas-projects-2065c173.vercel.app'
  }
};

// Determine the environment
const env = typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'development' : 'production';
const { API_BASE_URL } = config[env];

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `${API_BASE_URL}/api/auth/signup`,
    SIGNIN: `${API_BASE_URL}/api/auth/signin`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  },
  LISTINGS: {
    BASE: `${API_BASE_URL}/api/listings`,
    SLIDER: `${API_BASE_URL}/api/listings/slider`,
  },
  CONTACT: `${API_BASE_URL}/api/contact`,
};

// Log the configuration for debugging
console.log('Current Environment:', env);
console.log('API Base URL:', API_BASE_URL || '(using relative URLs)');
console.log('Full API Endpoints:', API_ENDPOINTS);
