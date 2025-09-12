// controllers/authController.js
import User from "../models/User.js";
import { generateAccessToken } from "../utils/jwt.js";
import validator from "validator";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

const authController = {
  // POST /api/auth/register - Đăng ký tài khoản
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng điền đầy đủ thông tin",
        });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Email không hợp lệ",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        });
      }

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }

      // Auto assign admin role cho email admin@admin.com
      const role =
        email.toLowerCase().trim() === "admin@admin.com" ? "admin" : "user";

      // Tạo user mới
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role,
      });

      await user.save();

      // Tạo JWT token
      const token = generateAccessToken(user);

      // Lưu token vào HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: {
          user: user.toSafeObject(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đăng ký",
        error: error.message,
      });
    }
  },

  // POST /api/auth/login - Đăng nhập
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập email và mật khẩu",
        });
      }

      // Tìm user (bao gồm password để so sánh)
      const user = await User.findOne({
        email: email.toLowerCase(),
        isActive: true,
      }).select("+password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // So sánh password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Cập nhật last login
      user.lastLogin = new Date();
      await user.save();

      // Tạo JWT token
      const token = generateAccessToken(user);

      // Lưu token vào HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          user: user.toSafeObject(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đăng nhập",
        error: error.message,
      });
    }
  },

  // GET /api/auth/me - Lấy thông tin user hiện tại
  getMe: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.json({
        success: true,
        data: {
          user: user.toSafeObject(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thông tin người dùng",
        error: error.message,
      });
    }
  },

  // POST /api/auth/logout - Đăng xuất
  logout: async (req, res) => {
    try {
      // Xóa token cookie
      res.clearCookie("token");

      res.json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đăng xuất",
        error: error.message,
      });
    }
  },

  // PUT /api/auth/profile - Cập nhật profile
  updateProfile: async (req, res) => {
    try {
      const { name, avatar } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (name) updateData.name = name.trim();
      if (avatar) updateData.avatar = avatar;

      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      res.json({
        success: true,
        message: "Cập nhật profile thành công",
        data: {
          user: user.toSafeObject(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi cập nhật profile",
        error: error.message,
      });
    }
  },

  // PUT /api/auth/change-password - Đổi mật khẩu
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu mới phải có ít nhất 6 ký tự",
        });
      }

      const user = await User.findById(userId).select("+password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Người dùng không tồn tại",
        });
      }

      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng",
        });
      }

      user.password = newPassword;
      await user.save();

      res.json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đổi mật khẩu",
        error: error.message,
      });
    }
  },

  // POST /api/auth/forgot-password - Quên mật khẩu
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập email",
        });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          message: "Email không hợp lệ",
        });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        // Không tiết lộ user có tồn tại hay không
        return res.json({
          success: true,
          message:
            "Nếu email tồn tại, bạn sẽ nhận được email khôi phục mật khẩu",
        });
      }

      // Tạo reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

      console.log("🔑 Generated reset token:", resetToken);
      console.log("🔑 Token length:", resetToken.length);
      console.log("⏰ Token expires at:", resetTokenExpires);
      console.log("⏰ Current time:", new Date());

      // Lưu token vào database
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpires;
      await user.save();

      // Gửi email khôi phục
      try {
        await sendPasswordResetEmail(user.email, resetToken);
        res.json({
          success: true,
          message: "Email khôi phục mật khẩu đã được gửi",
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Xóa token nếu gửi email thất bại
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(500).json({
          success: false,
          message: "Không thể gửi email. Vui lòng thử lại sau.",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý quên mật khẩu",
        error: error.message,
      });
    }
  },

  // POST /api/auth/reset-password - Đặt lại mật khẩu
  resetPassword: async (req, res) => {
    try {
      const { token, password } = req.body;

      console.log("🔍 Reset password request:");
      console.log("Token received:", token);
      console.log("Token length:", token?.length);
      console.log("Current time:", new Date());

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: "Token và mật khẩu là bắt buộc",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu phải có ít nhất 6 ký tự",
        });
      }

      // Tìm user theo reset token và kiểm tra expiry
      console.log("🔍 Looking for user with token:", token);
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
        isActive: true,
      });

      console.log("🔍 User found:", user ? "Yes" : "No");
      if (user) {
        console.log("User email:", user.email);
        console.log("Token expires at:", user.resetPasswordExpires);
        console.log("Current time:", new Date());
        console.log("Token expired:", user.resetPasswordExpires < new Date());
      }

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn",
        });
      }

      // Cập nhật mật khẩu
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: "Đặt lại mật khẩu thành công",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đặt lại mật khẩu",
        error: error.message,
      });
    }
  },

  // GET /api/auth/verify - Xác thực token
  verifyToken: async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Token không hợp lệ",
        });
      }

      res.json({
        success: true,
        message: "Token hợp lệ",
        data: {
          user: user.toSafeObject(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi xác thực token",
        error: error.message,
      });
    }
  },

  // GET /api/auth/stats - Admin only: Thống kê users
  getStats: async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập",
        });
      }

      const stats = await User.getStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê",
        error: error.message,
      });
    }
  },
};

export default authController;
