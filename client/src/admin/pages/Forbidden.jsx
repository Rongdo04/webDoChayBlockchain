import React from "react";
import { Link } from "react-router-dom";

export default function Forbidden() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-200 shadow-brand">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-10 h-10"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 00-5.25 5.25v2.379a3 3 0 00-.879 2.122l-.004 5.871A3.878 3.878 0 009.746 21.75h4.508a3.878 3.878 0 003.879-3.878l-.004-5.87a3 3 0 00-.879-2.122V6.75A5.25 5.25 0 0012 1.5zm3.75 7.5V6.75a3.75 3.75 0 10-7.5 0V9h7.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-semibold mb-3 text-emerald-900">
        403 - Không có quyền
      </h2>
      <p className="text-sm text-emerald-800/80 mb-6">
        Bạn không có quyền truy cập khu vực quản trị. Vui lòng quay lại trang
        chủ hoặc đăng nhập bằng tài khoản Admin.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/" className="btn-brand">
          Về trang chủ
        </Link>
        <Link
          to="/login"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-emerald-900 text-sm font-medium bg-white border border-emerald-900/10 shadow-sm hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2"
        >
          Đăng nhập
        </Link>
      </div>
    </div>
  );
}
