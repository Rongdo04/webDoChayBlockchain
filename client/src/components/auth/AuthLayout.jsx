// components/auth/AuthLayout.jsx
import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const AuthLayout = () => {
  const location = useLocation();
  const redirect = encodeURIComponent(location.pathname + location.search);
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Back to home button (ensure on top) */}
      <div className="absolute top-4 left-4 z-50 pointer-events-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-emerald-100/80 hover:text-white px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur border border-white/20 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-lime-400"
          aria-label="Quay về trang chủ"
        >
          <span className="text-lg" aria-hidden>
            ←
          </span>
          Trang chủ
        </Link>
      </div>
      {/* Background subtle leaf pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-15 mix-blend-overlay">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='160' height='160' viewBox='0 0 160 160' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.08' stroke-width='0.5'%3E%3Cpath d='M80 20c10 20 10 40 0 60-10-20-10-40 0-60zM40 60c12 8 18 16 20 30-12-8-18-16-20-30zm80 0c-12 8-18 16-20 30 12-8 18-16 20-30zM60 100c8 6 12 12 14 22-8-6-12-12-14-22zm40 0c-8 6-12 12-14 22 8-6 12-12 14-22z'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "320px 320px",
          }}
        ></div>
      </div>

      {/* Soft radial glow accents (make non-interactive) */}
      <div className="absolute -top-10 -left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 z-10">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-emerald-600 to-lime-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 ring-1 ring-white/20">
            <div className="h-11 w-11 bg-white/95 backdrop-blur rounded-xl flex items-center justify-center">
              <span
                className="text-emerald-600 text-2xl"
                role="img"
                aria-label="leaf"
              >
                🍃
              </span>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-emerald-50 tracking-tight">
            Cửa Hàng Đồ Chay
          </h2>
          <p className="mt-2 text-sm text-emerald-100/80">
            Không gian thanh tịnh – Dinh dưỡng xanh mỗi ngày
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl shadow-emerald-950/40 border border-white/20 p-8">
          <div className="bg-white rounded-xl p-6 shadow-inner ring-1 ring-emerald-900/5">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-emerald-100/70">
          <p>© 2025 Cửa Hàng Đồ Chay. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-emerald-100/60">
            <span>Thuần chay</span>
            <span>•</span>
            <span>Tươi sạch</span>
            <span>•</span>
            <span>Thanh tịnh</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
