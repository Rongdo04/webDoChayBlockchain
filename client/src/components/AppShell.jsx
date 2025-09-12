// AppShell.jsx - Basic layout shell with header/footer
import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function AppShell({ children }) {
  const nav = [
    { to: "/recipes", label: "Công thức" },
    { to: "/search", label: "Tìm kiếm" },
    { to: "/community", label: "Cộng đồng" },
    { to: "/profile", label: "Hồ sơ" },
  ];
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-brand text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-6 items-center">
          <button
            onClick={() => navigate("/")}
            className="font-semibold text-lg"
          >
            ChayTinh
          </button>
          <nav className="flex gap-2 text-sm">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg hover:bg-white/10 ${
                    isActive ? "bg-white/15" : ""
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden sm:block text-[12px] text-emerald-100">
              Ăn xanh - Sống lành
            </span>
            {isLoading ? (
              <span className="text-xs text-emerald-100/70">Đang tải...</span>
            ) : isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg text-xs">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-[11px] font-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  <div className="hidden sm:flex flex-col leading-tight">
                    <span className="font-semibold text-white/90 text-[11px] max-w-[120px] truncate">
                      {user?.name || "Người dùng"}
                    </span>
                    <span className="text-[10px] text-emerald-100/70">
                      {user?.role || "user"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-xs px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 transition font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md bg-white/15 hover:bg-white/25 transition font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 rounded-md bg-lime-400 text-emerald-900 font-semibold hover:bg-lime-300 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-emerald-950 text-emerald-50 text-xs py-6 text-center">
        © 2025 ChayTinh.
      </footer>
    </div>
  );
}
