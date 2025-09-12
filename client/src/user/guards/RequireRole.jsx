import React from "react";
import { useAuthAdapter } from "../../auth/useAuthAdapter.js";

export default function RequireRole({ role, children }) {
  const { role: currentRole, loading, isAuthenticated } = useAuthAdapter();
  if (loading) {
    return (
      <div
        className="min-h-[40vh] flex items-center justify-center text-sm text-emerald-700"
        role="status"
      >
        Đang xác thực...
      </div>
    );
  }
  if (!isAuthenticated || currentRole !== role) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6">
        <h1 className="text-2xl font-semibold bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
          403 - Không có quyền
        </h1>
        <p className="text-sm text-emerald-800/70">
          Bạn không có quyền truy cập nội dung này.
        </p>
      </div>
    );
  }
  return children;
}
