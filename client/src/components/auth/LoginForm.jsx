// components/auth/LoginForm.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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

    if (!formData.email || !formData.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setIsLoading(true);
      const response = await login(formData);

      const user = response.data.user;
      toast.success(`Chào mừng, ${user.name}!`);

      // Determine redirect target
      const params = new URLSearchParams(location.search);
      const redirectParam = params.get("redirect");
      if (redirectParam) {
        navigate(redirectParam, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent mb-2 tracking-tight">
          Đăng nhập
        </h3>
        <p className="text-sm text-emerald-700">
          Chào mừng trở lại với không gian xanh 🌿
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-emerald-800 mb-2"
          >
            Email
          </label>
          <div className="relative group">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="peer w-full px-3 py-2 border border-emerald-300/70 rounded-lg bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition shadow-sm placeholder:text-emerald-400"
              placeholder="Nhập email của bạn"
              disabled={isLoading}
            />
            <span className="pointer-events-none absolute -top-2 left-2 bg-white px-1 text-[10px] uppercase tracking-wider text-emerald-600 font-medium opacity-0 peer-focus:opacity-100 transition">
              Email
            </span>
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-emerald-800 mb-2"
          >
            Mật khẩu
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
              placeholder="Nhập mật khẩu"
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
              Mật khẩu
            </span>
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium underline-offset-2 hover:underline transition"
          >
            Quên mật khẩu?
          </Link>
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
              <span className="ml-2">Đang đăng nhập...</span>
            </div>
          ) : (
            <span className="relative">Đăng nhập</span>
          )}
        </button>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-sm text-emerald-700">
            Chưa có tài khoản?{" "}
            <Link
              to="/auth/register"
              className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
