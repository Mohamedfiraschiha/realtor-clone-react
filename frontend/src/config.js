// Using window.location.origin for production and fallback to environment variable
const getApiBaseUrl = () => {
  // In production, use the full URL from environment variable
  if (process.env.NODE_ENV === 'production') {
    return 'https://realtor-clone-react-4ziu-fdely25nb-firas-projects-2065c173.vercel.app';
  }
  // In development, use the proxy set in package.json
  return '';
};

const API_BASE_URL = getApiBaseUrl();

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

// Log the API base URL for debugging
console.log('Environment:', process.env.NODE_ENV);
console.log('API Base URL:', API_BASE_URL);
