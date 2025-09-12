// middleware/auth.js
import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

// Middleware xác thực token
export const authenticate = async (req, res, next) => {
  try {
    // Đọc token từ cookie thay vì header
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Không có token xác thực",
        },
      });
    }

    // Xác thực token
    const decoded = verifyToken(token);

    // Tìm user trong database
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "Token không hợp lệ - User không tồn tại",
        },
      });
    }

    // Gắn user vào request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Token không hợp lệ",
        details: { error: error.message },
      },
    });
  }
};

// Middleware kiểm tra quyền admin
export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Không có quyền truy cập",
      },
    });
  }
  next();
};

// Middleware kiểm tra quyền user hoặc admin
export const requireUser = (req, res, next) => {
  if (!["user", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      error: {
        code: "FORBIDDEN",
        message: "Không có quyền truy cập",
      },
    });
  }
  next();
};

// Middleware optional auth (không bắt buộc)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Bỏ qua lỗi, tiếp tục mà không có user
    next();
  }
};

export default {
  authenticate,
  requireAdmin,
  requireUser,
  optionalAuth,
};
