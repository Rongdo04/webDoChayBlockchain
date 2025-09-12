import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginRequiredModal({ open, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  if (!open) return null;

  const redirect = encodeURIComponent(location.pathname + location.search);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cần đăng nhập"
    >
      <div
        className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-emerald-900/10 space-y-5 animate-[fade_.2s_ease]">
        <h2 className="text-base font-semibold text-emerald-950">
          Bạn cần đăng nhập
        </h2>
        <p className="text-sm text-emerald-800/70 leading-relaxed">
          Vui lòng đăng nhập để sử dụng chức năng này.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900/10 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            Đóng
          </button>
          <button
            onClick={() => navigate(`/auth/login?redirect=${redirect}`)}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-100 focus:outline-none focus:ring-2 focus:ring-lime-400 shadow"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
