import React, { useState, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import { APIErrorDisplay } from "../components/ErrorBoundary.jsx";
import { t } from "../../i18n/index.js"; // added

const navItems = [
  { to: "/admin", label: t("nav.dashboard", "Bảng điều khiển"), exact: true },
  { to: "/admin/recipes", label: t("nav.recipes", "Công thức") },
  { to: "/admin/media", label: t("nav.media", "Thư viện media") },
  { to: "/admin/taxonomy", label: t("nav.taxonomy", "Danh mục & Thẻ") },
  { to: "/admin/moderation", label: t("nav.moderation", "Kiểm duyệt") },
  { to: "/admin/reports", label: t("nav.reports", "Báo cáo") },
  { to: "/admin/users", label: t("nav.users", "Người dùng") },
  { to: "/admin/settings", label: t("nav.settings", "Cài đặt") },
  { to: "/admin/api-test", label: "API Test", dev: true }, // Development only
];

function Sidebar({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 p-4 text-sm">
      {navItems
        .filter((item) => !item.dev || import.meta.env.DEV) // Only show dev items in development
        .map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onNavigate}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 font-medium transition inline-flex items-center gap-2 hover:bg-emerald-950/20 hover:text-emerald-50 ${
                isActive
                  ? "bg-emerald-950/40 text-lime-200"
                  : "text-emerald-50/80"
              }`
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                item.dev ? "bg-yellow-400/70" : "bg-lime-300/70"
              }`}
            />
            {item.label}
            {item.dev && (
              <span className="text-[10px] bg-yellow-400 text-black px-1 rounded">
                DEV
              </span>
            )}
          </NavLink>
        ))}
    </nav>
  );
}

export default function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const { handleApiError } = useAdminApi();
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Clear API errors when route changes
  useEffect(() => {
    setApiError(null);
  }, [location?.pathname]);

  // Check if user has admin access
  const hasAdminAccess = isAuthenticated && user?.role === "admin";

  if (!hasAdminAccess) {
    // This shouldn't happen due to RouteGuard, but just in case
    return (
      <div className="min-h-screen flex items-center justify-center">
        <APIErrorDisplay
          error={{
            isForbidden: true,
            message: "Bạn không có quyền truy cập khu vực quản trị",
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 flex-col bg-emerald-950/95 text-white">
        <div className="h-16 flex items-center px-4 font-bold tracking-wide text-lime-200">
          ADMIN
        </div>
        <Sidebar />
        <div className="mt-auto p-4 text-xs text-emerald-100/70">
          {user && (
            <div className="mb-3">
              <div className="font-semibold text-emerald-50 text-sm">
                {user.name}
              </div>
              <div className="text-emerald-200/70">{user.email}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="w-full text-left text-emerald-100/80 hover:text-white hover:underline text-xs"
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute left-0 top-0 bottom-0 w-64 bg-emerald-950/95 text-white flex flex-col transform transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-16 flex items-center px-4 font-bold tracking-wide text-lime-200">
            ADMIN
          </div>
          <Sidebar onNavigate={() => setOpen(false)} />
          <div className="mt-auto p-4 text-xs text-emerald-100/70">
            {user && (
              <div className="mb-3">
                <div className="font-semibold text-emerald-50 text-sm">
                  {user.name}
                </div>
                <div className="text-emerald-200/70">{user.email}</div>
              </div>
            )}
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
              className="w-full text-left text-emerald-100/80 hover:text-white hover:underline text-xs"
            >
              Đăng xuất
            </button>
          </div>
        </aside>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-brand text-white shadow-brand relative z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/15 active:bg-white/20 transition"
              onClick={() => setOpen((o) => !o)}
            >
              <span className="sr-only">Toggle menu</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5"
                />
              </svg>
            </button>
            <h1 className="text-lg font-semibold tracking-wide hidden sm:block">
              {t("nav.dashboard", "Bảng điều khiển")}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {user && <span className="hidden sm:inline">{user.name}</span>}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="p-4 md:p-6 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
