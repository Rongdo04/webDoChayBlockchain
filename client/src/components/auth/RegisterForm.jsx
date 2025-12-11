import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
// import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import Toast from "../../user/components/Toast";

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Toast state
  const [toastState, setToastState] = useState({
    open: false,
    type: "info",
    title: "",
    message: "",
    autoHide: 3000,
  });
  const showToast = (type, title, message, autoHide = 3000) =>
    setToastState({ open: true, type, title, message, autoHide });
  const closeToast = () => setToastState((p) => ({ ...p, open: false }));

  // Delay navigation for user to see toast
  const redirectTimer = useRef(null);
  useEffect(
    () => () => redirectTimer.current && clearTimeout(redirectTimer.current),
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      showToast(
        "error",
        "Thiếu thông tin",
        "Vui lòng điền đầy đủ thông tin",
        2500
      );
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      showToast(
        "error",
        "Mật khẩu không khớp",
        "Mật khẩu xác nhận không khớp",
        3000
      );
      return;
    }
    if (formData.password.length < 6) {
      showToast(
        "error",
        "Mật khẩu yếu",
        "Mật khẩu phải có ít nhất 6 ký tự",
        3000
      );
      return;
    }
    if (formData.name.length < 2) {
      showToast("error", "Tên quá ngắn", "Tên phải có ít nhất 2 ký tự", 3000);
      return;
    }

    try {
      setIsLoading(true);
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      const user = response.data.user;
      showToast(
        "success",
        "Đăng ký thành công",
        `Chào mừng ${user.name}!`,
        1800
      );

      redirectTimer.current = setTimeout(() => {
        const params = new URLSearchParams(location.search);
        const redirectParam = params.get("redirect");
        if (redirectParam) navigate(redirectParam, { replace: true });
        else if (user.role === "admin") navigate("/admin", { replace: true });
        else navigate("/dashboard", { replace: true });
      }, 600);
    } catch (error) {
      showToast(
        "error",
        "Đăng ký thất bại",
        error.response?.data?.message || "Đăng ký thất bại",
        3000
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast {...toastState} onClose={closeToast} />
      <div>
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent mb-2 tracking-tight">
            Đăng ký tài khoản
          </h3>
          <p className="text-sm text-emerald-700">
            Tham gia cộng đồng xanh thanh tịnh 🌱
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-emerald-800 mb-2"
            >
              Họ và tên
            </label>
            <div className="relative group">
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="peer w-full px-3 py-2 border border-emerald-300/70 rounded-lg bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition shadow-sm placeholder:text-emerald-400"
                placeholder="Nhập họ và tên"
                disabled={isLoading}
              />
              <span className="pointer-events-none absolute -top-2 left-2 bg-white px-1 text-[10px] uppercase tracking-wider text-emerald-600 font-medium opacity-0 peer-focus:opacity-100 transition">
                Họ và tên
              </span>
            </div>
          </div>

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
              placeholder="Nhập lại mật khẩu"
              disabled={isLoading}
            />
          </div>

          {/* Password requirements */}
          <div className="bg-emerald-50 p-3 rounded-lg ring-1 ring-emerald-900/5">
            <p className="text-sm text-emerald-900 font-medium mb-1">
              Yêu cầu mật khẩu:
            </p>
            <ul className="text-xs text-emerald-800 space-y-1">
              <li
                className={
                  formData.password.length >= 6 ? "text-emerald-700" : ""
                }
              >
                • Ít nhất 6 ký tự {formData.password.length >= 6 && <FaCheckCircle className="inline ml-1 text-green-500" />}
              </li>
              <li>• Nên bao gồm chữ hoa, chữ thường và số</li>
              <li>• Tránh sử dụng thông tin cá nhân</li>
            </ul>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full relative group bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-2.5 px-4 rounded-lg font-medium shadow hover:from-emerald-500 hover:to-lime-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/0 via-lime-300/0 to-emerald-400/0 group-hover:via-lime-300/20 transition" />
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Đang đăng ký...</span>
              </div>
            ) : (
              <span className="relative">Đăng ký</span>
            )}
          </button>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-emerald-700">
              Đã có tài khoản?{" "}
              <Link
                to="/auth/login"
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </form>

        {/* Terms */}
        <div className="mt-6 pt-6 border-t border-emerald-100">
          <p className="text-xs text-emerald-800/80 text-center">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <button className="text-emerald-600 hover:text-emerald-700 font-medium">
              Điều khoản sử dụng
            </button>{" "}
            và{" "}
            <button className="text-emerald-600 hover:text-emerald-700 font-medium">
              Chính sách bảo mật
            </button>{" "}
            của chúng tôi.
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterForm;
