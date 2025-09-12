import React from "react";

export default function LoginRequiredModal({ open, onClose, onLoginRedirect }) {
  if (!open) return null;

  const handleLoginRedirect = () => {
    const currentPath = window.location.pathname;
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    onLoginRedirect?.(redirectUrl);
    onClose?.();
  };

  const handleEscape = (e) => {
    if (e.key === "Escape") {
      onClose?.();
    }
  };

  React.useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Yêu cầu đăng nhập"
    >
      <div
        className="absolute inset-0 bg-emerald-950/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-emerald-900/10 space-y-5">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-emerald-100 to-lime-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-emerald-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-emerald-950">
            Cần đăng nhập
          </h2>
          <p className="text-sm text-emerald-800/70 leading-relaxed">
            Bạn cần đăng nhập để có thể báo cáo bài viết. Đăng nhập ngay để tiếp
            tục.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-900/5 text-emerald-900 hover:bg-emerald-900/10 focus:outline-none focus:ring-2 focus:ring-emerald-600/50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleLoginRedirect}
            className="flex-1 px-5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-br from-emerald-600 via-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 shadow transition-all"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
