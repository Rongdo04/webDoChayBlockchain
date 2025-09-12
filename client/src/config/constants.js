// config/constants.js
/**
 * Application constants
 * Centralized constants for the application
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
  GUEST: "guest",
};

// Permission levels
export const PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  DELETE: "delete",
  ADMIN: "admin",
};

// Route paths
export const ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USERS: "/admin/users",
  ADMIN_SETTINGS: "/admin/settings",

  // Error pages
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/401",
  FORBIDDEN: "/403",
  SERVER_ERROR: "/500",
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // User management
  USERS: {
    BASE: "/users",
    PROFILE: "/auth/me",
    UPDATE_PROFILE: "/auth/profile",
    UPLOAD_AVATAR: "/users/avatar",
    DELETE_ACCOUNT: "/users/account",
  },

  // Admin
  ADMIN: {
    BASE: "/admin",
    USERS: "/admin/users",
    STATISTICS: "/admin/statistics",
    SETTINGS: "/admin/settings",
  },

  // File upload
  UPLOAD: {
    IMAGE: "/upload/image",
    FILE: "/upload/file",
    AVATAR: "/upload/avatar",
  },

  // Reports
  REPORTS: "/reports",
};

// Local Storage Keys (for non-sensitive data only)
export const STORAGE_KEYS = {
  THEME: "theme",
  LANGUAGE: "language",
  PREFERENCES: "preferences",
};

// Event Types
export const EVENT_TYPES = {
  // Authentication events
  LOGIN_SUCCESS: "auth/login_success",
  LOGIN_FAILED: "auth/login_failed",
  LOGOUT: "auth/logout",
  TOKEN_EXPIRED: "auth/token_expired",

  // User events
  PROFILE_UPDATED: "user/profile_updated",
  PASSWORD_CHANGED: "user/password_changed",
  AVATAR_UPLOADED: "user/avatar_uploaded",

  // Application events
  THEME_CHANGED: "app/theme_changed",
  LANGUAGE_CHANGED: "app/language_changed",
  NOTIFICATION_RECEIVED: "app/notification_received",
};

// Theme Constants
export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

// Language Constants
export const LANGUAGES = {
  VI: "vi",
  EN: "en",
};

// Notification Types
export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

// File Upload Constants
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGES: ["jpg", "jpeg", "png", "gif", "webp"],
  ALLOWED_DOCUMENTS: ["pdf", "doc", "docx", "txt"],
  ALLOWED_ALL: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "pdf",
    "doc",
    "docx",
    "txt",
  ],
};

// Validation Constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10,11}$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  NAME_MAX_LENGTH: 50,
};

// Date/Time Constants
export const DATE_FORMATS = {
  DATE: "DD/MM/YYYY",
  DATETIME: "DD/MM/YYYY HH:mm",
  TIME: "HH:mm",
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  LIMIT_OPTIONS: [10, 20, 50, 100],
};

// Animation Duration
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
};

// Breakpoints (Tailwind CSS)
export const BREAKPOINTS = {
  SM: "640px",
  MD: "768px",
  LG: "1024px",
  XL: "1280px",
  "2XL": "1536px",
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Lỗi kết nối mạng",
  SERVER_ERROR: "Lỗi máy chủ",
  UNAUTHORIZED: "Không có quyền truy cập",
  FORBIDDEN: "Bị cấm truy cập",
  NOT_FOUND: "Không tìm thấy",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ",
  TOKEN_EXPIRED: "Phiên đăng nhập đã hết hạn",
  LOGIN_REQUIRED: "Vui lòng đăng nhập",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Đăng nhập thành công",
  REGISTER_SUCCESS: "Đăng ký thành công",
  LOGOUT_SUCCESS: "Đăng xuất thành công",
  PROFILE_UPDATED: "Cập nhật thông tin thành công",
  PASSWORD_CHANGED: "Đổi mật khẩu thành công",
  EMAIL_SENT: "Email đã được gửi",
  FILE_UPLOADED: "Tải file thành công",
};

// Default values
export const DEFAULTS = {
  AVATAR: "/assets/images/default-avatar.png",
  PAGE_TITLE: "MERN Authentication",
  LANGUAGE: LANGUAGES.VI,
  THEME: THEMES.LIGHT,
  TIMEZONE: "Asia/Ho_Chi_Minh",
};

export default {
  HTTP_STATUS,
  USER_ROLES,
  PERMISSIONS,
  ROUTES,
  API_ENDPOINTS,
  EVENT_TYPES,
  THEMES,
  LANGUAGES,
  NOTIFICATION_TYPES,
  FILE_UPLOAD,
  VALIDATION,
  DATE_FORMATS,
  PAGINATION,
  ANIMATION,
  BREAKPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  DEFAULTS,
};
