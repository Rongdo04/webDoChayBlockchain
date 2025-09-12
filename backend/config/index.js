// config/index.js
import dotenv from "dotenv";

dotenv.config();

const config = {
  // Server Configuration
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://localhost:27017/Web_Do_Chay",
  DB_NAME: process.env.DB_NAME || "Web_Do_Chay",

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "fallback_jwt_secret_for_development",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "24h",
  JWT_REFRESH_SECRET:
    process.env.JWT_REFRESH_SECRET || "fallback_refresh_secret",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  // Email Configuration
  EMAIL: {
    HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
    PORT: parseInt(process.env.EMAIL_PORT) || 587,
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS,
    FROM: process.env.EMAIL_FROM,
    FROM_NAME: process.env.EMAIL_FROM_NAME || "MERN Authentication",
  },

  // CORS Configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5174",
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : ["http://localhost:5174", "http://localhost:3000"],
  },

  // File Upload
  UPLOAD: {
    PATH: process.env.UPLOAD_PATH || "uploads",
    MAX_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    ALLOWED_TYPES: process.env.ALLOWED_FILE_TYPES
      ? process.env.ALLOWED_FILE_TYPES.split(",")
      : ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
  },

  // Security
  SECURITY: {
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
    SESSION_SECRET: process.env.SESSION_SECRET || "fallback_session_secret",
    COOKIE_SECRET: process.env.COOKIE_SECRET || "fallback_cookie_secret",
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 15, // minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Logging
  LOGGING: {
    LEVEL: process.env.LOG_LEVEL || "info",
    ENABLE: process.env.ENABLE_LOGGING !== "false",
  },

  // Admin Configuration
  ADMIN: {
    EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
    PASSWORD: process.env.ADMIN_PASSWORD || "admin123456",
  },

  // Helper methods
  isDevelopment: () => config.NODE_ENV === "development",
  isProduction: () => config.NODE_ENV === "production",
  isTest: () => config.NODE_ENV === "test",
};

export default config;
