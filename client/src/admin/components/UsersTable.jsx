/** UsersTable with API Integration
 * Columns: Avatar | Name & Email | Role (select admin|user) | Status (with toggle)
 * Features: search, role/status filters, pagination, inline role change, status toggle
 */
import React, { useState, useEffect, useCallback } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx";
import StatusPill from "./StatusPill.jsx";
import Toast from "./Toast.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import { t } from "../../i18n";

export default function UsersTable() {
  const adminApi = useAdminApi();
  const { user: currentUser } = useAuth();

  // State
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", type: "success" });
  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [cursor, setCursor] = useState("");
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const showToast = (msg, type = "success") => {
    setToast({ open: true, msg, type });
  };

  // Load users from API
  const loadUsers = useCallback(
    async (resetCursor = false) => {
      setLoading(true);
      try {
        const params = {
          limit: 20,
          cursor: resetCursor ? "" : cursor,
        };

        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (roleFilter) params.role = roleFilter;
        if (statusFilter) params.status = statusFilter;

        const result = await adminApi.safeApiCall(
          () => adminApi.getUsers(params),
          { defaultErrorMessage: "Không thể tải danh sách người dùng" }
        );

        if (result.success) {
          const responseData = result.data?.data || result.data || {};
          const userItems = responseData.items || responseData || [];

          if (resetCursor) {
            setUsers(Array.isArray(userItems) ? userItems : []);
          } else {
            setUsers((prev) => [
              ...prev,
              ...(Array.isArray(userItems) ? userItems : []),
            ]);
          }

          setCursor(responseData.pageInfo?.nextCursor || "");
          setHasNext(responseData.pageInfo?.hasNext || false);
          setTotal(responseData.total || 0);
        } else {
          showToast(
            result.error?.message || "Không thể tải danh sách người dùng",
            "error"
          );
        }
      } catch (error) {
        console.error("Failed to load users:", error);
        showToast("Không thể tải danh sách người dùng", "error");
      } finally {
        setLoading(false);
      }
    },
    [debouncedSearch, roleFilter, statusFilter, cursor, adminApi]
  );

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers(true);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const displayRole = (role) => (role === "admin" ? "admin" : "user");

  // Helper to check if user is current user
  const isCurrentUser = (user) => {
    return (
      currentUser &&
      (user._id === currentUser._id || user._id === currentUser.id)
    );
  };

  // Helper to check if action should be disabled
  const shouldDisableAction = (user) => {
    return isCurrentUser(user);
  };

  // Handle role change
  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;

    // Additional frontend check for current user
    if (isCurrentUser(user)) {
      showToast("Không thể thay đổi quyền của chính mình", "error");
      return;
    }

    const result = await adminApi.safeApiCall(
      () => adminApi.updateUserRole(user._id, newRole),
      { defaultErrorMessage: `Không thể thay đổi quyền cho ${user.name}` }
    );

    if (result.success) {
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, role: newRole } : u))
      );
      showToast(`Đã thay đổi quyền cho ${user.name}`, "success");
    } else {
      // Handle specific error codes
      if (result.error?.code === "LAST_ADMIN_PROTECTION") {
        showToast("Không thể loại bỏ quyền admin của admin cuối cùng", "error");
      } else if (result.error?.status === 403) {
        showToast("Bạn không có quyền thực hiện hành động này", "error");
      } else {
        showToast(
          result.error?.message || `Không thể thay đổi quyền cho ${user.name}`,
          "error"
        );
      }
    }
  };

  // Handle status toggle
  const handleStatusToggle = (user) => {
    const newStatus = user.isActive ? "blocked" : "active";
    const action = user.isActive ? "khóa" : "mở khóa";

    setConfirm({
      open: true,
      title: `${action === "khóa" ? "Khóa" : "Mở khóa"} người dùng`,
      message: `Bạn có chắc muốn ${action} tài khoản của ${user.name}?`,
      onConfirm: () => updateUserStatus(user, newStatus),
    });
  };

  const updateUserStatus = async (user, newStatus) => {
    // Additional frontend check for current user
    if (isCurrentUser(user)) {
      showToast("Không thể thay đổi trạng thái của chính mình", "error");
      return;
    }

    const result = await adminApi.safeApiCall(
      () => adminApi.updateUserStatus(user._id, newStatus),
      { defaultErrorMessage: `Không thể thay đổi trạng thái cho ${user.name}` }
    );

    if (result.success) {
      // Update local state - backend returns isActive field
      const updatedUser = result.data?.data || result.data;
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: updatedUser.isActive } : u
        )
      );
      const action = updatedUser.isActive ? "đã mở khóa" : "đã khóa";
      showToast(`${action} tài khoản ${user.name}`, "success");
    } else {
      // Handle specific error codes
      if (result.error?.code === "SELF_STATUS_MODIFICATION_FORBIDDEN") {
        showToast("Không thể thay đổi trạng thái của chính mình", "error");
      } else if (result.error?.code === "LAST_ADMIN_PROTECTION") {
        showToast("Không thể khóa admin cuối cùng", "error");
      } else if (result.error?.status === 403) {
        showToast("Bạn không có quyền thực hiện hành động này", "error");
      } else {
        showToast(
          result.error?.message ||
            `Không thể thay đổi trạng thái cho ${user.name}`,
          "error"
        );
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="input w-full"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input"
          >
            <option value="">Tất cả quyền</option>
            <option value="admin">Quản trị</option>
            <option value="user">Người dùng</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Results info */}
      {!loading && (
        <div className="text-sm text-emerald-800/70">
          Hiển thị {users.length} / {total} người dùng
        </div>
      )}

      {/* Table */}
      <div className="border border-emerald-900/15 rounded-xl overflow-hidden bg-white shadow-sm">
        {loading && users.length === 0 ? (
          <div className="p-8 text-center text-emerald-600">
            <div className="text-sm">Đang tải...</div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-emerald-950/90 text-emerald-50 text-left">
              <tr>
                <th className="px-4 py-2 text-xs uppercase tracking-wide font-semibold">
                  {t("users.user", "User")}
                </th>
                <th className="px-4 py-2 text-xs uppercase tracking-wide font-semibold">
                  {t("users.role", "Role")}
                </th>
                <th className="px-4 py-2 text-xs uppercase tracking-wide font-semibold">
                  {t("users.status", "Status")}
                </th>
                <th className="px-4 py-2 text-xs uppercase tracking-wide font-semibold w-32">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="border-b last:border-b-0 border-emerald-900/10 hover:bg-emerald-50/60"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          u.name
                            .split(" ")
                            .map((p) => p[0])
                            .join("")
                            .slice(0, 2)
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-emerald-950 leading-tight">
                          {u.name}
                        </p>
                        <p className="text-xs text-emerald-800/70">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <select
                      aria-label={t("users.role", "Role") + " " + u.name}
                      value={displayRole(u.role)}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      disabled={isCurrentUser(u)}
                      className={`text-xs bg-white border border-emerald-900/20 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-lime-400 ${
                        isCurrentUser(u) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      title={
                        isCurrentUser(u)
                          ? "Không thể thay đổi quyền của chính mình"
                          : ""
                      }
                    >
                      <option value="user">
                        {t("user.user", "Người dùng")}
                      </option>
                      <option value="admin">
                        {t("user.admin", "Quản trị")}
                      </option>
                    </select>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <StatusPill status={u.isActive ? "active" : "blocked"} />
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {isCurrentUser(u) ? (
                      <span
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 cursor-not-allowed"
                        title="Không thể khóa tài khoản của chính mình"
                      >
                        Tài khoản hiện tại
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStatusToggle(u)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          u.isActive
                            ? "bg-rose-600 text-white hover:bg-rose-500"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                        }`}
                      >
                        {u.isActive ? "Khóa" : "Mở khóa"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-emerald-800/70"
                  >
                    {search || roleFilter || statusFilter
                      ? "Không tìm thấy người dùng nào"
                      : t("users.noUsers", "Chưa có người dùng")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* Load more button */}
        {hasNext && (
          <div className="p-4 border-t border-emerald-900/10 text-center">
            <button
              onClick={() => loadUsers(false)}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "Đang tải..." : "Tải thêm"}
            </button>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.msg}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

      {/* Confirm modal */}
      <ConfirmModal
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        onConfirm={() => {
          confirm.onConfirm?.();
          setConfirm({ open: false, title: "", message: "", onConfirm: null });
        }}
        onCancel={() =>
          setConfirm({ open: false, title: "", message: "", onConfirm: null })
        }
      />
    </div>
  );
}
