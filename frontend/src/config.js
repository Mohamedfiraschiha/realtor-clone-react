// Base URL for API requests
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

// API endpoints
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
