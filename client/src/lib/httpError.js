// src/lib/httpError.js
/**
 * Standardized HTTP Error class for API responses
 */
export class HttpError extends Error {
  constructor(code, message, details = null, status = null) {
    super(message);
    this.name = "HttpError";
    this.code = code;
    this.status = status;
    this.details = details;
  }

  /**
   * Create HttpError from API response error object
   * @param {Object} errorResponse - Error response from API
   * @param {number} status - HTTP status code
   * @returns {HttpError}
   */
  static fromApiResponse(errorResponse, status) {
    const { code, message, details } = errorResponse.error || {};
    return new HttpError(
      code || "UNKNOWN_ERROR",
      message || "Đã xảy ra lỗi không xác định",
      details,
      status
    );
  }

  /**
   * Create HttpError for network/connection issues
   * @param {string} originalMessage - Original error message
   * @returns {HttpError}
   */
  static networkError(originalMessage = "") {
    return new HttpError(
      "NETWORK_ERROR",
      "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      { originalMessage }
    );
  }

  /**
   * Create HttpError for timeout issues
   * @returns {HttpError}
   */
  static timeoutError() {
    return new HttpError(
      "TIMEOUT_ERROR",
      "Yêu cầu quá thời gian cho phép. Vui lòng thử lại.",
      { timeout: true }
    );
  }

  /**
   * Create HttpError for parsing issues
   * @param {string} originalMessage - Original parsing error
   * @returns {HttpError}
   */
  static parseError(originalMessage = "") {
    return new HttpError("PARSE_ERROR", "Phản hồi từ server không hợp lệ.", {
      originalMessage,
    });
  }

  /**
   * Get Vietnamese message for common error codes
   * @returns {string}
   */
  getLocalizedMessage() {
    const messages = {
      UNAUTHORIZED: "Bạn cần đăng nhập để tiếp tục",
      FORBIDDEN: "Bạn không có quyền truy cập tính năng này",
      NOT_FOUND: "Không tìm thấy tài nguyên yêu cầu",
      VALIDATION_ERROR: "Dữ liệu không hợp lệ",
      NETWORK_ERROR: "Lỗi kết nối mạng",
      TIMEOUT_ERROR: "Yêu cầu quá thời gian cho phép",
      PARSE_ERROR: "Lỗi xử lý dữ liệu",
      INTERNAL_ERROR: "Lỗi server nội bộ. Vui lòng thử lại sau.",
      TOO_MANY_REQUESTS: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
      SERVICE_UNAVAILABLE: "Dịch vụ tạm thời không khả dụng",
    };

    return (
      messages[this.code] || this.message || "Đã xảy ra lỗi không xác định"
    );
  }

  /**
   * Convert to plain object for logging/debugging
   * @returns {Object}
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      status: this.status,
      details: this.details,
      stack: this.stack,
    };
  }

  /**
   * Check if error is authentication related
   * @returns {boolean}
   */
  isAuthError() {
    return this.code === "UNAUTHORIZED" || this.status === 401;
  }

  /**
   * Check if error is authorization related
   * @returns {boolean}
   */
  isAuthorizationError() {
    return this.code === "FORBIDDEN" || this.status === 403;
  }

  /**
   * Check if error is client-side (4xx)
   * @returns {boolean}
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  /**
   * Check if error is server-side (5xx)
   * @returns {boolean}
   */
  isServerError() {
    return this.status >= 500;
  }
}

export default HttpError;
