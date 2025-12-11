/**
 * Error mapping utility for Vietnamese error messages
 * Maps HTTP status codes and common error codes to user-friendly Vietnamese messages
 */

export const ERROR_MESSAGES = {
  // HTTP Status Codes
  400: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.",
  401: "Bạn cần đăng nhập để thực hiện thao tác này.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  409: "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.",
  422: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.",
  429: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
  500: "Lỗi máy chủ. Vui lòng thử lại sau.",
  502: "Lỗi kết nối. Vui lòng thử lại sau.",
  503: "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.",

  // Common Error Codes
  NETWORK_ERROR: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.",
  TIMEOUT: "Yêu cầu hết thời gian chờ. Vui lòng thử lại.",
  VALIDATION_ERROR: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.",
  AUTHENTICATION_REQUIRED: "Bạn cần đăng nhập để tiếp tục.",
  PERMISSION_DENIED: "Bạn không có quyền thực hiện thao tác này.",
  RESOURCE_NOT_FOUND: "Không tìm thấy dữ liệu yêu cầu.",
  DUPLICATE_RESOURCE: "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.",
  SERVER_ERROR: "Lỗi máy chủ. Vui lòng thử lại sau.",
  UNKNOWN_ERROR: "Đã xảy ra lỗi không xác định. Vui lòng thử lại.",

  // Specific Error Messages
  INVALID_EMAIL: "Địa chỉ email không hợp lệ.",
  INVALID_PASSWORD: "Mật khẩu không đúng.",
  PASSWORD_TOO_SHORT: "Mật khẩu phải có ít nhất 6 ký tự.",
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp.",
  EMAIL_ALREADY_EXISTS: "Email đã được sử dụng.",
  USER_NOT_FOUND: "Không tìm thấy người dùng.",
  RECIPE_NOT_FOUND: "Không tìm thấy công thức.",
  POST_NOT_FOUND: "Không tìm thấy bài viết.",
  COMMENT_NOT_FOUND: "Không tìm thấy bình luận.",
  MEDIA_NOT_FOUND: "Không tìm thấy tệp media.",
  CATEGORY_NOT_FOUND: "Không tìm thấy danh mục.",
  TAG_NOT_FOUND: "Không tìm thấy thẻ.",
  REPORT_NOT_FOUND: "Không tìm thấy báo cáo.",

  // Form Validation
  REQUIRED_FIELD: "Trường này là bắt buộc.",
  INVALID_URL: "URL không hợp lệ.",
  INVALID_PHONE: "Số điện thoại không hợp lệ.",
  INVALID_DATE: "Ngày tháng không hợp lệ.",
  FILE_TOO_LARGE: "Tệp quá lớn. Vui lòng chọn tệp nhỏ hơn.",
  INVALID_FILE_TYPE: "Loại tệp không được hỗ trợ.",

  // Success Messages
  SAVED_SUCCESSFULLY: "Đã lưu thành công.",
  UPDATED_SUCCESSFULLY: "Đã cập nhật thành công.",
  DELETED_SUCCESSFULLY: "Đã xóa thành công.",
  CREATED_SUCCESSFULLY: "Đã tạo thành công.",
  SUBMITTED_SUCCESSFULLY: "Đã gửi thành công.",
  UPLOADED_SUCCESSFULLY: "Đã tải lên thành công.",
};

/**
 * Get Vietnamese error message from error object or status code
 * @param {Error|number|string} error - Error object, HTTP status code, or error code
 * @param {string} fallback - Fallback message if no mapping found
 * @returns {string} Vietnamese error message
 */
export function getErrorMessage(
  error,
  fallback = ERROR_MESSAGES.UNKNOWN_ERROR
) {
  // Handle HTTP status codes
  if (typeof error === "number") {
    return ERROR_MESSAGES[error] || fallback;
  }

  // Handle error objects
  if (error && typeof error === "object") {
    // Check for status code
    if (error.status) {
      return ERROR_MESSAGES[error.status] || fallback;
    }

    // Check for response status
    if (error.response?.status) {
      return ERROR_MESSAGES[error.response.status] || fallback;
    }

    // Check for error code
    if (error.code) {
      return ERROR_MESSAGES[error.code] || fallback;
    }

    // Check for error message
    if (error.message) {
      // Try to match common error patterns
      const message = error.message.toLowerCase();

      if (message.includes("network") || message.includes("fetch")) {
        return ERROR_MESSAGES.NETWORK_ERROR;
      }
      if (message.includes("timeout")) {
        return ERROR_MESSAGES.TIMEOUT;
      }
      if (message.includes("validation")) {
        return ERROR_MESSAGES.VALIDATION_ERROR;
      }
      if (message.includes("unauthorized") || message.includes("401")) {
        return ERROR_MESSAGES[401];
      }
      if (message.includes("forbidden") || message.includes("403")) {
        return ERROR_MESSAGES[403];
      }
      if (message.includes("not found") || message.includes("404")) {
        return ERROR_MESSAGES[404];
      }
      if (message.includes("conflict") || message.includes("409")) {
        return ERROR_MESSAGES[409];
      }
      if (message.includes("unprocessable") || message.includes("422")) {
        return ERROR_MESSAGES[422];
      }
      if (message.includes("server") || message.includes("500")) {
        return ERROR_MESSAGES[500];
      }
    }
  }

  // Handle string error codes
  if (typeof error === "string") {
    return ERROR_MESSAGES[error] || fallback;
  }

  return fallback;
}

/**
 * Get success message
 * @param {string} action - Action performed
 * @returns {string} Vietnamese success message
 */
export function getSuccessMessage(action) {
  const successMessages = {
    save: ERROR_MESSAGES.SAVED_SUCCESSFULLY,
    update: ERROR_MESSAGES.UPDATED_SUCCESSFULLY,
    delete: ERROR_MESSAGES.DELETED_SUCCESSFULLY,
    create: ERROR_MESSAGES.CREATED_SUCCESSFULLY,
    submit: ERROR_MESSAGES.SUBMITTED_SUCCESSFULLY,
    upload: ERROR_MESSAGES.UPLOADED_SUCCESSFULLY,
  };

  return successMessages[action] || ERROR_MESSAGES.SAVED_SUCCESSFULLY;
}
