/** ModerationQueue - API Integration with Fixed State Management
 * Manages comments moderation with real API
 * Actions: Approve, Hide, Delete -> API calls with force refresh
 * Filters: status (pending|approved|hidden), recipeId
 * Bulk operations: approve/hide multiple comments
 */
import React, { useEffect, useState, useCallback } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import StatusPill from "./StatusPill.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import Toast from "./Toast.jsx";
import Pagination from "./Pagination.jsx";
import { t } from "../../i18n/index.js";

export default function ModerationQueue_fixed() {
  const adminApi = useAdminApi();

  // State
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [recipeIdFilter, setRecipeIdFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // Force refresh trigger
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });

  // UI State
  const [panel, setPanel] = useState(null); // { type, item }
  const [bulkIds, setBulkIds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false); // Prevent multiple clicks
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    items: [],
  });
  const [toast, setToast] = useState({ open: false, msg: "", type: "info" });

  // Load comments from API
  const loadComments = useCallback(async () => {
    setLoading(true);

    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };
    if (statusFilter !== "all") params.status = statusFilter;
    if (recipeIdFilter) params.recipeId = recipeIdFilter;

    const result = await adminApi.safeApiCall(
      () => adminApi.getComments(params),
      { defaultErrorMessage: "Không thể tải danh sách bình luận" }
    );

    if (result.success) {
      const responseData = result.data;
      const comments = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];
      const paginationInfo = responseData?.pagination || {};
      setData(comments);
      setTotal(paginationInfo.total || comments.length);
      setPagination((prev) => ({
        ...prev,
        hasNext: paginationInfo.hasNext || false,
        hasPrev: paginationInfo.hasPrev || false,
      }));
    } else {
      showToast("Không thể tải danh sách bình luận", "error");
    }

    setLoading(false);
  }, [
    adminApi,
    pagination.page,
    pagination.limit,
    statusFilter,
    recipeIdFilter,
    refreshKey,
  ]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Helper functions
  const showToast = (msg, type = "info") => setToast({ open: true, msg, type });

  const forceRefresh = () => setRefreshKey((prev) => prev + 1);

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRecipeIdFilterChange = (recipeId) => {
    setRecipeIdFilter(recipeId);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Actions
  const approveComment = async (commentId) => {
    if (actionLoading) return;
    setActionLoading(true);
    const result = await adminApi.safeApiCall(
      () => adminApi.approveComment(commentId),
      { defaultErrorMessage: "Không thể phê duyệt bình luận" }
    );
    if (result.success) {
      showToast("Đã phê duyệt bình luận", "success");
      forceRefresh();
    } else {
      showToast(
        result.error?.message || "Không thể phê duyệt bình luận",
        "error"
      );
    }
    setActionLoading(false);
  };

  const hideComment = async (commentId) => {
    if (actionLoading) return;
    setActionLoading(true);
    const result = await adminApi.safeApiCall(
      () => adminApi.hideComment(commentId),
      { defaultErrorMessage: "Không thể ẩn bình luận" }
    );
    if (result.success) {
      showToast("Đã ẩn bình luận", "success");
      forceRefresh();
    } else {
      showToast(result.error?.message || "Không thể ẩn bình luận", "error");
    }
    setActionLoading(false);
  };

  const deleteComment = async (commentId) => {
    if (actionLoading) return;
    setActionLoading(true);
    const result = await adminApi.safeApiCall(
      () => adminApi.deleteComment(commentId),
      { defaultErrorMessage: "Không thể xóa bình luận" }
    );
    if (result.success) {
      showToast("Đã xóa bình luận", "success");
      forceRefresh();
    } else {
      showToast(result.error?.message || "Không thể xóa bình luận", "error");
    }
    setActionLoading(false);
  };

  const bulkAction = async (action, ids) => {
    if (actionLoading) return;
    setActionLoading(true);
    const result = await adminApi.safeApiCall(
      () => adminApi.bulkComments({ ids, action }),
      { defaultErrorMessage: `Không thể thực hiện hành động ${action}` }
    );
    if (result.success) {
      const actionText =
        action === "approve" ? "phê duyệt" : action === "hide" ? "ẩn" : "xóa";
      showToast(`Đã ${actionText} ${ids.length} bình luận`, "success");
      setBulkIds([]);
      forceRefresh();
    } else {
      showToast(
        result.error?.message || "Không thể thực hiện hành động",
        "error"
      );
    }
    setActionLoading(false);
  };

  const askAction = (action, items) => {
    setConfirm({
      open: true,
      action,
      items: Array.isArray(items) ? items : [items],
    });
  };

  const doAction = async () => {
    if (actionLoading) return;
    const { action, items } = confirm;
    setConfirm({ open: false, action: null, items: [] });
    if (items.length === 1) {
      const id = items[0]._id || items[0].id;
      if (action === "approve") await approveComment(id);
      else if (action === "hide") await hideComment(id);
      else if (action === "delete") await deleteComment(id);
    } else {
      const ids = items.map((i) => i._id || i.id);
      await bulkAction(action, ids);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString("vi-VN");

  // Styled Filter Bar (match taxonomy UI)
  const FilterBar = () => (
    <div className="p-4 rounded-2xl bg-white border border-emerald-900/15 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Status Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-emerald-800">
              {t("common.status", "Trạng thái")}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="input w-44"
              aria-label={t("common.status")}
            >
              <option value="all">{t("common.all", "Tất cả")}</option>
              <option value="pending">
                {t("comments.pending", "Chờ duyệt")}
              </option>
              <option value="approved">
                {t("comments.approved", "Đã duyệt")}
              </option>
              <option value="hidden">{t("comments.hidden", "Đã ẩn")}</option>
            </select>
          </div>

          {/* Recipe ID Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-emerald-800">
              Recipe ID
            </label>
            <input
              type="search"
              value={recipeIdFilter}
              onChange={(e) => handleRecipeIdFilterChange(e.target.value)}
              placeholder="Nhập Recipe ID..."
              className="input w-60"
              aria-label="Recipe ID"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {bulkIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800/70">
              {t("common.selected", "Đã chọn")} {bulkIds.length}{" "}
              {t("comments.items", "bình luận")}
            </span>
            <button
              onClick={() =>
                askAction(
                  "approve",
                  data.filter((item) => bulkIds.includes(item._id || item.id))
                )
              }
              className="btn-brand"
              disabled={actionLoading}
            >
              {t("actions.approve", "Phê duyệt")}
            </button>
            <button
              onClick={() =>
                askAction(
                  "hide",
                  data.filter((item) => bulkIds.includes(item._id || item.id))
                )
              }
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-lime-400"
              disabled={actionLoading}
            >
              {t("actions.hide", "Ẩn")}
            </button>
            <button
              onClick={() =>
                askAction(
                  "delete",
                  data.filter((item) => bulkIds.includes(item._id || item.id))
                )
              }
              className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
              disabled={actionLoading}
            >
              {t("actions.delete", "Xóa")}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const CommentRow = ({ comment }) => {
    const isSelected = bulkIds.includes(comment._id || comment.id);
    return (
      <tr
        className={`border-b last:border-b-0 border-emerald-900/10 hover:bg-emerald-50/60 ${
          isSelected ? "bg-emerald-50/60" : ""
        }`}
      >
        <td className="px-4 py-3 align-middle">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              const id = comment._id || comment.id;
              if (e.target.checked) {
                setBulkIds((prev) => [...prev, id]);
              } else {
                setBulkIds((prev) => prev.filter((bulkId) => bulkId !== id));
              }
            }}
            aria-label="Chọn bình luận"
          />
        </td>
        <td className="px-4 py-3 align-middle">
          <div className="text-sm">
            <div className="font-medium text-emerald-900/90">
              {comment.content?.slice(0, 100) || ""}
              {comment.content?.length > 100 ? "…" : ""}
            </div>
            <div className="text-xs text-emerald-800/70">
              ID: {comment._id || comment.id}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 align-middle">
          <div className="text-sm">
            <div className="text-emerald-900/90">
              {comment.user?.username || "Anonymous"}
            </div>
            <div className="text-xs text-emerald-800/70">
              {comment.user?.email}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 align-middle">
          <StatusPill status={comment.status} />
        </td>
        <td className="px-4 py-3 align-middle text-xs text-emerald-800/70">
          {formatDate(comment.createdAt)}
        </td>
        <td className="px-4 py-3 align-middle">
          <div className="flex gap-2">
            {comment.status === "pending" && (
              <button
                onClick={() => askAction("approve", comment)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium btn-brand"
                disabled={actionLoading}
              >
                {t("actions.approve", "Duyệt")}
              </button>
            )}
            {comment.status !== "hidden" && (
              <button
                onClick={() => askAction("hide", comment)}
                className="px-3 py-1.5 rounded-lg bg-emerald-900/10 text-emerald-900 text-xs font-medium hover:bg-emerald-900/20"
                disabled={actionLoading}
              >
                {t("actions.hide", "Ẩn")}
              </button>
            )}
            <button
              onClick={() => askAction("delete", comment)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500"
              disabled={actionLoading}
            >
              {t("actions.delete", "Xóa")}
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-emerald-600">
        <div className="text-sm">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4">
      <FilterBar />

      <div className="border border-emerald-900/15 rounded-xl overflow-hidden bg-white shadow-sm">
        <table
          className="w-full text-sm"
          role="table"
          aria-label="Bảng bình luận chờ kiểm duyệt"
        >
          <thead className="bg-emerald-950/90 text-emerald-50 text-left">
            <tr>
              <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide w-10">
                <input
                  type="checkbox"
                  checked={bulkIds.length === data.length && data.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBulkIds(data.map((item) => item._id || item.id));
                    } else {
                      setBulkIds([]);
                    }
                  }}
                  aria-label="Chọn tất cả"
                />
              </th>
              <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                {t("comments.content", "Nội dung")}
              </th>
              <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                {t("comments.user", "Người dùng")}
              </th>
              <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                {t("comments.status", "Trạng thái")}
              </th>
              <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                {t("common.createdAt", "Ngày tạo")}
              </th>
              <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide w-32">
                {t("table.actions", "Hành động")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((comment) => (
              <CommentRow key={comment._id || comment.id} comment={comment} />
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-emerald-800/70"
                >
                  {t("comments.empty", "Không có bình luận nào")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t p-0">
        <Pagination
          currentPage={pagination.page}
          totalPages={Math.ceil(total / pagination.limit)}
          onPageChange={handlePageChange}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          total={total}
        />
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirm.open}
        onCancel={() => setConfirm({ open: false, action: null, items: [] })}
        onConfirm={doAction}
        title={`Xác nhận ${
          confirm.action === "approve"
            ? "phê duyệt"
            : confirm.action === "hide"
            ? "ẩn"
            : "xóa"
        }`}
        message={`Bạn có chắc chắn muốn ${
          confirm.action === "approve"
            ? "phê duyệt"
            : confirm.action === "hide"
            ? "ẩn"
            : "xóa"
        } ${confirm.items.length} bình luận?`}
        confirmLabel={
          confirm.action === "approve"
            ? t("actions.approve", "Phê duyệt")
            : confirm.action === "hide"
            ? t("actions.hide", "Ẩn")
            : t("actions.delete", "Xóa")
        }
        danger={confirm.action === "delete"}
      />

      {/* Toast */}
      <Toast
        open={toast.open}
        message={toast.msg}
        type={toast.type}
        onClose={() => setToast({ open: false, msg: "", type: "info" })}
      />
    </div>
  );
}
