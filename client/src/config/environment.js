// config/environment.js
/**
 * Environment configuration
 * Centralized configuration for different environments
 */

const environment = {
  // Current environment
  NODE_ENV: import.meta.env.NODE_ENV || "development",

  // API Configuration
  API: {
    BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    VERSION: import.meta.env.VITE_API_VERSION || "v1",
  },

  // App Configuration
  APP: {
    NAME: import.meta.env.VITE_APP_NAME || "MERN Authentication",
    VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
    DESCRIPTION:
      import.meta.env.VITE_APP_DESCRIPTION ||
      "MERN Stack Authentication System",
    URL: import.meta.env.VITE_APP_URL || "http://localhost:5174",
  },

  // Authentication
  AUTH: {
    TOKEN_KEY: import.meta.env.VITE_TOKEN_KEY || "token",
    USER_KEY: import.meta.env.VITE_USER_KEY || "user",
    REMEMBER_KEY: import.meta.env.VITE_REMEMBER_KEY || "remember_me",
    SESSION_TIMEOUT:
      parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 24 * 60 * 60 * 1000, // 24 hours
  },

  // Storage
  STORAGE: {
    PREFIX: import.meta.env.VITE_STORAGE_PREFIX || "Web_Do_Chay_",
    ENCRYPTION_KEY: import.meta.env.VITE_ENCRYPTION_KEY || "default_key",
  },

  // Features
  FEATURES: {
    ENABLE_NOTIFICATIONS: import.meta.env.VITE_ENABLE_NOTIFICATIONS === "true",
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    ENABLE_PWA: import.meta.env.VITE_ENABLE_PWA === "true",
    ENABLE_SERVICE_WORKER:
      import.meta.env.VITE_ENABLE_SERVICE_WORKER === "true",
  },

  // Debug and Logging
  DEBUG: {
    ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING !== "false",
    LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || "info",
    ENABLE_REDUX_DEVTOOLS:
      import.meta.env.VITE_ENABLE_REDUX_DEVTOOLS === "true",
  },

  // External Services
  SERVICES: {
    GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
    FIREBASE_CONFIG: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    },
  },

  // UI Configuration
  UI: {
    THEME: import.meta.env.VITE_DEFAULT_THEME || "light",
    LANGUAGE: import.meta.env.VITE_DEFAULT_LANGUAGE || "vi",
    TIMEZONE: import.meta.env.VITE_DEFAULT_TIMEZONE || "Asia/Ho_Chi_Minh",
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE:
      parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    ALLOWED_FILE_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(",") || [
      "jpg",
      "jpeg",
      "png",
      "gif",
      "pdf",
    ],
    UPLOAD_ENDPOINT: import.meta.env.VITE_UPLOAD_ENDPOINT || "/upload",
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 10,
    MAX_PAGE_SIZE: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
  },
};

// Helper functions
export const config = {
  ...environment,

  // Check if development environment
  isDevelopment: () => environment.NODE_ENV === "development",

  // Check if production environment
  isProduction: () => environment.NODE_ENV === "production",

  // Check if test environment
  isTest: () => environment.NODE_ENV === "test",

  // Get full API URL
  getApiUrl: (endpoint = "") => {
    const baseUrl = environment.API.BASE_URL.replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
  },

  // Get storage key with prefix
  getStorageKey: (key) => `${environment.STORAGE.PREFIX}${key}`,

  // Check if feature is enabled
  isFeatureEnabled: (feature) => environment.FEATURES[feature] === true,

  // Get formatted app info
  getAppInfo: () => ({
    name: environment.APP.NAME,
    version: environment.APP.VERSION,
    description: environment.APP.DESCRIPTION,
    environment: environment.NODE_ENV,
    buildTime: new Date().toISOString(),
  }),
};

export default config;
