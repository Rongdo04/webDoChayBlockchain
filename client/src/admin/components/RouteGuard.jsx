import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

/**
 * RouteGuard: Only allow role 'admin'. If authenticated but role !== admin -> /admin/forbidden
 * If not authenticated -> redirect login (keep redirect back to admin path after login in search params).
 */
export default function RouteGuard({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="p-6 text-center text-sm text-emerald-600">
        Đang kiểm tra...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(
          location.pathname + location.search
        )}`}
        replace
      />
    );
  }

  if (user && user.role !== "admin") {
    return <Navigate to="/admin/forbidden" replace />;
  }

  return children;
}
