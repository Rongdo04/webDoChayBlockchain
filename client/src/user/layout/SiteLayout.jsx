import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthAdapter } from "../../auth/useAuthAdapter.js";

export default function SiteLayout({ children }) {
  const [mobileSearch, setMobileSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const { isAuthenticated, user, role, logout, getAccessToken } =
    useAuthAdapter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setMobileSearch(false);
  };

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/recipes", label: "Công thức" },
    { to: "/community", label: "Cộng đồng" },
    { to: "/submit", label: "Đăng công thức" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-emerald-900/10 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-200 flex items-center justify-center font-semibold text-sm shadow-brand group-hover:scale-105 transition">
              R
            </div>
            <span className="font-semibold text-emerald-950 tracking-tight hidden sm:block">
              RecipeHub
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white shadow-brand"
                      : "text-emerald-800 hover:bg-emerald-900/10"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {role === "admin" && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white shadow-brand"
                      : "text-emerald-800 hover:bg-emerald-900/10"
                  }`
                }
              >
                Quản trị
              </NavLink>
            )}
          </nav>
          {/* Search desktop */}
          <form
            onSubmit={submitSearch}
            className="hidden md:block ml-auto relative"
            role="search"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className="w-64 rounded-xl bg-white/70 border border-emerald-900/15 pl-9 pr-3 py-2 text-sm shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
            />
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/70 pointer-events-none"
              aria-hidden
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1012 19.5a7.5 7.5 0 004.65-2.85z"
                />
              </svg>
            </span>
          </form>
          {/* Desktop user menu */}
          <div className="hidden md:flex items-center gap-3 ml-auto">
            {getAccessToken() && (
              <span
                className="px-2 py-1 rounded-lg bg-emerald-900/5 text-[10px] font-medium text-emerald-900/60 border border-emerald-900/10"
                aria-label="Phiên hợp lệ"
              >
                Phiên
              </span>
            )}
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/auth/login?redirect=${encodeURIComponent(
                    location.pathname + location.search
                  )}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-100 shadow focus:outline-none focus:ring-2 focus:ring-lime-400"
                  aria-label="Đăng nhập"
                >
                  Đăng nhập
                </Link>
                <Link
                  to={`/auth/register?redirect=${encodeURIComponent(
                    location.pathname + location.search
                  )}`}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-emerald-900 border border-emerald-900/15 hover:bg-emerald-900/5 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                  aria-label="Đăng ký"
                >
                  Đăng ký
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Mở menu người dùng"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white border border-emerald-900/15 hover:bg-emerald-900/5 focus:outline-none focus:ring-2 focus:ring-lime-400"
                >
                  <img
                    src={user?.avatar || "https://placehold.co/40x40?text=U"}
                    alt={user?.name || "Người dùng"}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-emerald-900/80 max-w-[120px] truncate">
                    {user?.name || "Người dùng"}
                  </span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-emerald-900/10 shadow-lg p-2 z-50"
                  >
                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-emerald-900/5 text-emerald-900"
                    >
                      Hồ sơ của tôi
                    </Link>
                    {role === "admin" && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        onClick={() => setMenuOpen(false)}
                        className="block w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-emerald-900/5 text-emerald-900"
                      >
                        Trang quản trị
                      </Link>
                    )}
                    <button
                      role="menuitem"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-emerald-900/5 text-emerald-900"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile right controls (search + auth) */}
          <div className="ml-auto md:hidden flex items-center gap-2">
            <button
              aria-label="Mở tìm kiếm"
              onClick={() => setMobileSearch(true)}
              className="w-9 h-9 rounded-xl bg-white border border-emerald-900/15 flex items-center justify-center text-emerald-800 shadow-sm active:scale-95"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
            {!isAuthenticated && (
              <Link
                to={`/auth/login?redirect=${encodeURIComponent(
                  location.pathname + location.search
                )}`}
                aria-label="Đăng nhập"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-100 flex items-center justify-center text-xs font-medium shadow active:scale-95"
              >
                ĐN
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to={`/auth/register?redirect=${encodeURIComponent(
                  location.pathname + location.search
                )}`}
                aria-label="Đăng ký"
                className="w-9 h-9 rounded-xl bg-white border border-emerald-900/15 flex items-center justify-center text-emerald-800 text-xs font-medium shadow-sm active:scale-95"
              >
                ĐK
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={() => navigate("/profile")}
                aria-label="Mở hồ sơ"
                className="w-9 h-9 rounded-xl bg-white border border-emerald-900/15 flex items-center justify-center text-emerald-800 shadow-sm active:scale-95 overflow-hidden"
              >
                <img
                  src={user?.avatar || "https://placehold.co/40x40?text=U"}
                  alt={user?.name || "Người dùng"}
                  className="w-full h-full object-cover rounded-xl"
                />
              </button>
            )}
          </div>
        </div>
        {/* Mobile search drawer */}
        {mobileSearch && (
          <div className="md:hidden border-t border-emerald-900/10 bg-white/95 backdrop-blur animate-[fade_.2s_ease]">
            <form
              onSubmit={submitSearch}
              className="px-4 py-3 flex items-center gap-2"
            >
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="flex-1 rounded-xl bg-white border border-emerald-900/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white shadow-brand"
              >
                Tìm
              </button>
              <button
                type="button"
                onClick={() => setMobileSearch(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white shadow-sm"
              >
                Đóng
              </button>
            </form>
          </div>
        )}
      </header>
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <footer className="mt-12 border-t border-emerald-900/10 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid gap-8 md:grid-cols-3 text-sm">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
              RecipeHub
            </h3>
            <p className="text-emerald-800/70 leading-snug">
              Nền tảng chia sẻ công thức & cộng đồng ẩm thực.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
              Liên kết
            </h3>
            <ul className="space-y-1">
              <li>
                <Link className="hover:underline text-emerald-800" to="/about">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link className="hover:underline text-emerald-800" to="/policy">
                  Chính sách
                </Link>
              </li>
              <li>
                <Link
                  className="hover:underline text-emerald-800"
                  to="/contact"
                >
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70">
              Theo dõi
            </h3>
            <p className="text-emerald-800/70 text-xs">
              © {new Date().getFullYear()} RecipeHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
