// API endpoints - using relative URLs since frontend and backend are on the same domain
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: `/api/auth/signup`,
    SIGNIN: `/api/auth/signin`,
    FORGOT_PASSWORD: `/api/auth/forgot-password`,
    RESET_PASSWORD: `/api/auth/reset-password`,
  },
  LISTINGS: {
    BASE: `/api/listings`,
    SLIDER: `/api/listings/slider`,
  },
  CONTACT: `/api/contact`,
};
