import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthAdapter } from "../../auth/useAuthAdapter.js";

export default function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuthAdapter();
  const location = useLocation();

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
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth/login?redirect=${redirect}`} replace />;
  }
  return children;
}
