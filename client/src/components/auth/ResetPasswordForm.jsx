// components/auth/ResetPasswordForm.jsx
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import authAPI from "../../services/authAPI";
import LoadingSpinner from "../ui/LoadingSpinner";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Token khôi phục không hợp lệ");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.resetPassword(token, formData.password);
      toast.success("Đặt lại mật khẩu thành công!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi đặt lại mật khẩu");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center">
        <div className="text-emerald-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent mb-2">
          Token không hợp lệ
        </h3>
        <p className="text-emerald-800 mb-6">
          Link khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.
        </p>
        <button
          onClick={() => navigate("/forgot-password")}
          className="w-full relative group bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-2.5 px-4 rounded-lg font-medium shadow hover:from-emerald-500 hover:to-lime-500 transition"
        >
          Gửi lại email khôi phục
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="text-emerald-500 text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent mb-2">
          Đặt lại mật khẩu
        </h3>
        <p className="text-sm text-emerald-700">
          Nhập mật khẩu mới cho tài khoản của bạn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* New Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-emerald-800 mb-2"
          >
            Mật khẩu mới
          </label>
          <div className="relative group">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              className="peer w-full px-3 py-2 border border-emerald-300/70 rounded-lg bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition shadow-sm placeholder:text-emerald-400"
              placeholder="Nhập mật khẩu mới"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-emerald-400 hover:text-emerald-600 transition"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
            <span className="pointer-events-none absolute -top-2 left-2 bg-white px-1 text-[10px] uppercase tracking-wider text-emerald-600 font-medium opacity-0 peer-focus:opacity-100 transition">
              Mật khẩu mới
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-emerald-800 mb-2"
          >
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-emerald-300/70 rounded-lg bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition shadow-sm placeholder:text-emerald-400"
            placeholder="Nhập lại mật khẩu mới"
            disabled={isLoading}
          />
        </div>

        {/* Password Requirements */}
        <div className="bg-emerald-50 p-3 rounded-lg ring-1 ring-emerald-900/5">
          <p className="text-sm text-emerald-900 font-medium mb-1">
            Yêu cầu mật khẩu:
          </p>
          <ul className="text-xs text-emerald-800 space-y-1">
            <li>• Ít nhất 6 ký tự</li>
            <li>• Nên bao gồm chữ hoa, chữ thường và số</li>
            <li>• Tránh sử dụng thông tin cá nhân</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full relative group bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-2.5 px-4 rounded-lg font-medium shadow hover:from-emerald-500 hover:to-lime-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/0 via-lime-300/0 to-emerald-400/0 group-hover:via-lime-300/20 transition" />
          {isLoading ? (
            <div className="flex items-center justify-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2">Đang xử lý...</span>
            </div>
          ) : (
            <span className="relative">Đặt lại mật khẩu</span>
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
          >
            ← Quay lại đăng nhập
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
