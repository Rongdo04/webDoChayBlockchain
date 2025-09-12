// useAuthAdapter.js - Chuẩn hoá interface auth theo hợp đồng tích hợp
// Trả về: { user, role, isAuthenticated, loading, login, logout, refresh, getAccessToken }
import { useAuth } from "../contexts/AuthContext.jsx";

export function useAuthAdapter() {
  const { user, isAuthenticated, isLoading, login, logout, loadUser } =
    useAuth();

  return {
    user,
    role: user?.role || (user ? "user" : null),
    isAuthenticated,
    loading: isLoading,
    login,
    logout,
    refresh: loadUser, // ánh xạ refresh -> loadUser
    getAccessToken: () => null, // Token dùng cookie HTTP-only -> không truy cập JS
  };
}

export default useAuthAdapter;
