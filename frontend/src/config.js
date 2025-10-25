// Configuration for different environments
const isLocalhost =
  typeof window !== "undefined" && window.location.hostname === "localhost";
const isDev = process.env.NODE_ENV === "development" || isLocalhost;

// Get the current hostname
const hostname = typeof window !== "undefined" ? window.location.hostname : "";

// Determine the base URL for API requests
let API_BASE_URL = "";

// Highest priority: explicit env override provided at build time
const ENV_BASE =
  typeof process !== "undefined"
    ? process.env.REACT_APP_API_BASE_URL
    : undefined;

if (isDev) {
  // In development, use the proxy set in package.json
  API_BASE_URL = "";
} else if (hostname.includes("vercel.app")) {
  // If this is the separate frontend deployment, point to the backend project domain to avoid 404s.
  if (hostname.startsWith("fourwalls-")) {
    API_BASE_URL = "https://fourwalls.vercel.app";
  } else {
    // Otherwise prefer same-origin
    API_BASE_URL = "";
  }
}

// Allow env to override in production if provided
if (!isDev && ENV_BASE) {
  API_BASE_URL = ENV_BASE;
}

// For production on the same domain, use relative URLs (empty string)

const ENDPOINTS = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    SIGNIN: "/api/auth/signin",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password",
  },
  USER: {
    PROFILE: "/api/user/profile",
  },
  USERS: {
    BASE: "/api/users",
  },
  LISTINGS: {
    BASE: "/api/listings",
    SLIDER: "/api/listings/slider",
    SEARCH: "/api/listings/search",
  },
  CHAT: {
    MESSAGES: "/api/chat/messages",
    CONVERSATIONS: "/api/chat/conversations",
    READ: "/api/chat/read",
  },
  CONTACT: "/api/contact",
};

// Add base URL to all endpoints
const addBaseUrl = (endpoints, baseUrl) => {
  const result = {};
  for (const [key, value] of Object.entries(endpoints)) {
    if (typeof value === "object") {
      result[key] = addBaseUrl(value, baseUrl);
    } else {
      result[key] = baseUrl + value;
    }
  }
  return result;
};

export const API_ENDPOINTS = addBaseUrl(ENDPOINTS, API_BASE_URL);

// Log the configuration for debugging
console.log("Environment:", isDev ? "development" : "production");
console.log("API Base URL:", API_BASE_URL || "(using relative URLs)");
console.log("API Endpoints:", API_ENDPOINTS);
