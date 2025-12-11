import React, { useState } from "react";
import { Link } from "react-router-dom";
// import { toast } from "react-toastify";
import authAPI from "../../services/authAPI";
import LoadingSpinner from "../ui/LoadingSpinner";
import Toast from "../../user/components/Toast";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("error", "Thiếu email", "Vui lòng nhập email", 2500);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      showToast("error", "Email không hợp lệ", "Email không hợp lệ", 3000);
      return;
    }

    try {
      setIsLoading(true);
      await authAPI.forgotPassword(email);
      setIsEmailSent(true);
      showToast(
        "success",
        "Đã gửi email",
        "Email khôi phục đã được gửi!",
        2500
      );
    } catch (error) {
      showToast(
        "error",
        "Gửi thất bại",
        error.response?.data?.message || "Lỗi khi gửi email khôi phục",
        3000
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <>
        <Toast {...toastState} onClose={closeToast} />
        <div className="text-center">
          <div className="text-emerald-500 text-6xl mb-4">📧</div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent mb-2">
            Email đã được gửi!
          </h3>
          <p className="text-emerald-800 mb-6">
            Chúng tôi đã gửi link khôi phục mật khẩu đến email{" "}
            <span className="font-semibold text-emerald-900">{email}</span>. Vui
            lòng kiểm tra hộp thư và làm theo hướng dẫn.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail("");
              }}
              className="w-full relative group bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-2.5 px-4 rounded-lg font-medium shadow hover:from-emerald-500 hover:to-lime-500 transition"
            >
              Gửi lại email
            </button>

            <Link
              to="/auth/login"
              className="block w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>

          <div className="mt-6 p-4 bg-emerald-50 rounded-lg ring-1 ring-emerald-900/5">
            <p className="text-sm text-emerald-900">
              <span className="font-medium">Lưu ý:</span> Link khôi phục có hiệu
              lực trong 15 phút. Nếu không thấy email, vui lòng kiểm tra thư mục
              spam.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast {...toastState} onClose={closeToast} />
      <div>
        <div className="text-center mb-6">
          <div className="text-emerald-500 text-6xl mb-4">🔑</div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-lime-600 bg-clip-text text-transparent mb-2">
            Quên mật khẩu?
          </h3>
          <p className="text-sm text-emerald-700">
            Nhập email, chúng tôi sẽ gửi link khôi phục mật khẩu cho bạn
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="peer w-full px-3 py-2 border border-emerald-300/70 rounded-lg bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition shadow-sm placeholder:text-emerald-400"
                placeholder="Nhập email của bạn"
                disabled={isLoading}
              />
              <span className="pointer-events-none absolute -top-2 left-2 bg-white px-1 text-[10px] uppercase tracking-wider text-emerald-600 font-medium opacity-0 peer-focus:opacity-100 transition">
                Email
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full relative group bg-gradient-to-r from-emerald-600 to-lime-600 text-white py-2.5 px-4 rounded-lg font-medium shadow hover:from-emerald-500 hover:to-lime-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-emerald-400/0 via-lime-300/0 to-emerald-400/0 group-hover:via-lime-300/20 transition" />
            {isLoading ? (
              <div className="flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">Đang gửi...</span>
              </div>
            ) : (
              <span className="relative">Gửi email khôi phục</span>
            )}
          </button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/auth/login"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </form>

        {/* Help Info */}
        <div className="mt-6 pt-6 border-t border-emerald-100">
          <div className="bg-emerald-50 p-4 rounded-lg ring-1 ring-emerald-900/5">
            <h4 className="text-sm font-medium text-emerald-900 mb-2">
              💡 Gợi ý:
            </h4>
            <ul className="text-xs text-emerald-800 space-y-1">
              <li>• Kiểm tra chính xác email đã đăng ký</li>
              <li>• Link khôi phục có hiệu lực trong 15 phút</li>
              <li>• Kiểm tra cả thư mục spam/rác</li>
              <li>• Liên hệ admin nếu vẫn gặp vấn đề</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordForm;
