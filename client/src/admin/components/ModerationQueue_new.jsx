/** ModerationQueue - API Integration
 * Manages comments moderation with real API
 * Actions: Approve, Hide -> API calls with refetch
 * Filters: status (pending|approved|hidden), recipeId
 * Bulk operations: approve/hide multiple comm      if (refreshResult.success) {
        console.log("🔄 Refresh result:", refreshResult);
        const responseData = refreshResult.data;s
 */
import React, { useEffect, useState, useCallback } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import StatusPill from "./StatusPill.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import Toast from "./Toast.jsx";
import Pagination from "./Pagination.jsx";
import { t } from "../../i18n/index.js";

export default function ModerationQueue_new() {
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
    limit: 20,
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
    console.log("🔄 Loading comments...");
    setLoading(true);

    const params = {
      page: pagination.page,
      limit: pagination.limit,
    };

    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    if (recipeIdFilter) {
      params.recipeId = recipeIdFilter;
    }

    console.log("🔄 Loading with params:", params);

    const result = await adminApi.safeApiCall(
      () => adminApi.getComments(params),
      {
        defaultErrorMessage: "Không thể tải danh sách bình luận",
      }
    );

    if (result.success) {
      console.log("🐛 DEBUG - Comments result:", result);
      console.log("🐛 DEBUG - result.data:", result.data);

      // API returns { success: true, data: [...], pagination: {...} }
      const responseData = result.data;
      const comments = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];
      const paginationInfo = responseData?.pagination || {};

      console.log("🐛 DEBUG - comments array:", comments);
      console.log("🐛 DEBUG - pagination info:", paginationInfo);

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
    console.log("🔄 Loading complete");
  }, [
    adminApi,
    pagination.page,
    pagination.limit,
    statusFilter,
    recipeIdFilter,
    refreshKey, // Add refreshKey to force refresh
  ]);

  // Load data on mount and when filters change
  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // Helper functions
  const showToast = (msg, type = "info") => {
    setToast({ open: true, msg, type });
  };

  const forceRefresh = () => {
    console.log("🔄 Force refreshing comments...");
    setRefreshKey((prev) => prev + 1);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  // Actions
  const openPanel = (item) => {
    setPanel({ type: "comment", item });
  };

  const closePanel = () => setPanel(null);

  const approveComment = async (commentId) => {
    if (actionLoading) return;
    setActionLoading(true);

    const result = await adminApi.safeApiCall(
      () => adminApi.approveComment(commentId),
      {
        defaultErrorMessage: "Không thể phê duyệt bình luận",
      }
    );

    if (result.success) {
      showToast("Đã phê duyệt bình luận", "success");

      // Force immediate refresh
      console.log("🔄 Triggering refresh after approve...");
      forceRefresh();

      // Update rating if backend returns it
      const approvedComment = result.data?.data || result.data;
      if (approvedComment?.recipe?.ratingAvg !== undefined) {
        // Could update parent recipe rating here if needed
      }
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
      {
        defaultErrorMessage: "Không thể ẩn bình luận",
      }
    );

    if (result.success) {
      showToast("Đã ẩn bình luận", "success");

      // Force immediate refresh
      console.log("🔄 Triggering refresh after hide...");
      forceRefresh();
    } else {
      showToast(result.error?.message || "Không thể ẩn bình luận", "error");
    }

    setActionLoading(false);
  };

  const deleteComment = async (commentId) => {
    if (actionLoading) return;
    setActionLoading(true);

    console.log("🔥 Deleting comment:", commentId);

    const result = await adminApi.safeApiCall(
      () => adminApi.deleteComment(commentId),
      {
        defaultErrorMessage: "Không thể xóa bình luận",
      }
    );

    console.log("🔥 Delete result:", result);

    if (result.success) {
      showToast("Đã xóa bình luận", "success");

      // Immediately reload data from API to ensure UI is up to date
      console.log("🔄 Reloading comments after delete...");

      // Force reload by calling loadComments immediately
      const currentPage = pagination.page;
      const currentLimit = pagination.limit;
      const currentStatusFilter = statusFilter;
      const currentRecipeFilter = recipeIdFilter;

      const params = {
        page: currentPage,
        limit: currentLimit,
      };

      if (currentStatusFilter !== "all") {
        params.status = currentStatusFilter;
      }

      if (currentRecipeFilter) {
        params.recipeId = currentRecipeFilter;
      }

      const refreshResult = await adminApi.safeApiCall(
        () => adminApi.getComments(params),
        {
          defaultErrorMessage: "Không thể tải lại danh sách bình luận",
        }
      );

      if (refreshResult.success) {
        console.log("� Refresh result:", refreshResult);
        const responseData = refreshResult.data;
        const comments = Array.isArray(responseData)
          ? responseData
          : responseData?.data || [];
        const paginationInfo = responseData?.pagination || {};

        console.log("🔄 Setting new data:", comments);
        setData(comments);
        setTotal(paginationInfo.total || comments.length);
        setPagination((prev) => ({
          ...prev,
          hasNext: paginationInfo.hasNext || false,
          hasPrev: paginationInfo.hasPrev || false,
        }));
      }
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
      {
        defaultErrorMessage: `Không thể thực hiện hành động ${action}`,
      }
    );

    if (result.success) {
      const actionText =
        action === "approve" ? "phê duyệt" : action === "hide" ? "ẩn" : "xóa";
      showToast(`Đã ${actionText} ${ids.length} bình luận`, "success");
      setBulkIds([]);

      // Force immediate refresh
      console.log("🔄 Reloading comments after bulk action...");
      await loadComments();
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

    // Close confirm modal immediately to prevent double-clicks
    setConfirm({ open: false, action: null, items: [] });

    if (items.length === 1) {
      // Single item action
      if (action === "approve") {
        await approveComment(items[0]._id || items[0].id);
      } else if (action === "hide") {
        await hideComment(items[0]._id || items[0].id);
      } else if (action === "delete") {
        await deleteComment(items[0]._id || items[0].id);
      }
    } else {
      // Bulk action
      const ids = items.map((item) => item._id || item.id);
      await bulkAction(action, ids);
    }
  };

  // Bulk selection handlers
  const handleBulkSelection = (selectedIds) => {
    setBulkIds(selectedIds);
  };

  const handleBulkApprove = () => {
    const selectedComments = data.filter((comment) =>
      bulkIds.includes(comment._id || comment.id)
    );
    askAction("approve", selectedComments);
  };

  const handleBulkHide = () => {
    const selectedComments = data.filter((comment) =>
      bulkIds.includes(comment._id || comment.id)
    );
    askAction("hide", selectedComments);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-emerald-200 rounded w-1/3 mb-2"></div>
          <div className="h-32 bg-emerald-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          <option value="all">
            {t("filters.allStatuses", "Tất cả trạng thái")}
          </option>
          <option value="pending">{t("status.pending", "Chờ duyệt")}</option>
          <option value="approved">{t("status.approved", "Đã duyệt")}</option>
          <option value="hidden">{t("status.hidden", "Đã ẩn")}</option>
        </select>

        <input
          type="text"
          value={recipeIdFilter}
          onChange={(e) => setRecipeIdFilter(e.target.value)}
          placeholder={t("filters.recipeId", "Lọc theo Recipe ID")}
          className="rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
        />
      </div>

      {/* Bulk Actions */}
      {bulkIds.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <span className="text-sm text-emerald-900">
            {bulkIds.length} {t("table.selected", "đã chọn")}
          </span>
          <button
            onClick={handleBulkApprove}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            {t("actions.approve", "Phê duyệt")}
          </button>
          <button
            onClick={handleBulkHide}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            {t("actions.hide", "Ẩn")}
          </button>
          <button
            onClick={() => setBulkIds([])}
            className="ml-auto text-xs text-emerald-700 hover:underline"
          >
            {t("actions.close", "Đóng")}
          </button>
        </div>
      )}

      {/* Comments Table */}
      <div className="border border-emerald-900/15 rounded-xl overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-emerald-950/90 text-emerald-50 text-left">
            <tr>
              <th className="px-4 py-2 w-12">
                <input
                  type="checkbox"
                  checked={bulkIds.length === data.length && data.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setBulkIds(
                        data.map((comment) => comment._id || comment.id)
                      );
                    } else {
                      setBulkIds([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-4 py-2 text-xs uppercase tracking-wide font-semibold">
                {t("moderation.comment", "Bình luận")}
              </th>
              <th className="px-4 py-2 text-xs uppercase tracking-wide font-semibold">
                {t("table.status", "Trạng thái")}
              </th>
              <th className="px-4 py-2 text-xs uppercase tracking-wide font-semibold w-40">
                {t("table.actions", "Hành động")}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((comment) => (
              <tr
                key={comment._id || comment.id}
                className="border-b last:border-b-0 border-emerald-900/10 hover:bg-emerald-50/60"
              >
                <td className="px-4 py-2">
                  <input
                    type="checkbox"
                    checked={bulkIds.includes(comment._id || comment.id)}
                    onChange={(e) => {
                      const commentId = comment._id || comment.id;
                      if (e.target.checked) {
                        setBulkIds([...bulkIds, commentId]);
                      } else {
                        setBulkIds(bulkIds.filter((id) => id !== commentId));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-4 py-2 align-top">
                  <div className="line-clamp-2 text-emerald-900/90 text-sm mb-1">
                    {comment.content}
                  </div>
                  <div className="text-xs text-emerald-700/70 mb-1">
                    {t("moderation.author", "Tác giả")}:{" "}
                    {comment.authorName || comment.author?.name || "Ẩn danh"}
                  </div>
                  <button
                    type="button"
                    onClick={() => openPanel(comment)}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    {t("actions.viewContext", "Xem chi tiết")}
                  </button>
                </td>
                <td className="px-4 py-2 align-middle">
                  <StatusPill
                    status={
                      comment.status === "pending"
                        ? "review"
                        : comment.status === "hidden"
                        ? "rejected"
                        : "published"
                    }
                  />
                </td>
                <td className="px-4 py-2 align-middle">
                  <div className="flex gap-2">
                    <button
                      disabled={comment.status === "approved" || actionLoading}
                      onClick={() => askAction("approve", [comment])}
                      className="px-3 py-1.5 rounded-lg bg-emerald-900/10 text-emerald-900 text-xs font-medium hover:bg-emerald-900/20 disabled:opacity-40"
                    >
                      {t("actions.approve", "Phê duyệt")}
                    </button>
                    <button
                      disabled={comment.status === "hidden" || actionLoading}
                      onClick={() => askAction("hide", [comment])}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500 disabled:opacity-40"
                    >
                      {t("actions.hide", "Ẩn")}
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => askAction("delete", [comment])}
                      className="px-3 py-1.5 rounded-lg bg-red-700 text-white text-xs font-medium hover:bg-red-600 disabled:opacity-40"
                    >
                      {actionLoading ? "..." : t("actions.delete", "Xóa")}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-emerald-800/70"
                >
                  {t("moderation.noComments", "Không có bình luận nào.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > pagination.limit && (
        <Pagination
          currentPage={pagination.page}
          totalItems={total}
          itemsPerPage={pagination.limit}
          onPageChange={handlePageChange}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
        />
      )}

      {/* Side Panel */}
      {panel && (
        <div
          className="fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
          aria-label="Context panel"
        >
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={closePanel}
          />
          <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-emerald-900/10 flex flex-col animate-[fade_.2s_ease]">
            <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-emerald-900">
                {t("moderation.context", "Chi tiết bình luận")}
              </h3>
              <button
                onClick={closePanel}
                className="text-xs text-emerald-700 hover:underline"
              >
                {t("actions.close", "Đóng")}
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70 mb-2">
                    {t("moderation.comment", "Bình luận")}
                  </h4>
                  <p className="text-sm text-emerald-900 bg-emerald-50 p-3 rounded-lg">
                    {panel.item.content}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70 mb-2">
                    {t("moderation.author", "Tác giả")}
                  </h4>
                  <p className="text-sm text-emerald-900">
                    {panel.item.authorName ||
                      panel.item.author?.name ||
                      "Ẩn danh"}
                  </p>
                </div>
                {panel.item.rating && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70 mb-2">
                      {t("moderation.rating", "Đánh giá")}
                    </h4>
                    <p className="text-sm text-emerald-900">
                      {panel.item.rating}/5 ⭐
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70 mb-2">
                    {t("moderation.recipe", "Công thức")}
                  </h4>
                  <p className="text-sm text-emerald-900">
                    {panel.item.recipeTitle ||
                      `Recipe ID: ${panel.item.recipeId}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirm.open}
        title={
          confirm.action === "approve"
            ? t("moderation.approveTitle", "Phê duyệt bình luận")
            : confirm.action === "hide"
            ? t("moderation.hideTitle", "Ẩn bình luận")
            : t("moderation.deleteTitle", "Xóa bình luận")
        }
        message={
          confirm.items.length === 1
            ? confirm.action === "approve"
              ? t("moderation.approveMessage", "Phê duyệt bình luận này?")
              : confirm.action === "hide"
              ? t("moderation.hideMessage", "Ẩn bình luận này?")
              : t(
                  "moderation.deleteMessage",
                  "Xóa vĩnh viễn bình luận này? Hành động này không thể hoàn tác."
                )
            : confirm.action === "approve"
            ? t(
                "moderation.bulkApproveMessage",
                `Phê duyệt ${confirm.items.length} bình luận?`
              )
            : confirm.action === "hide"
            ? t(
                "moderation.bulkHideMessage",
                `Ẩn ${confirm.items.length} bình luận?`
              )
            : t(
                "moderation.bulkDeleteMessage",
                `Xóa vĩnh viễn ${confirm.items.length} bình luận? Hành động này không thể hoàn tác.`
              )
        }
        confirmLabel={
          confirm.action === "approve"
            ? t("actions.approve", "Phê duyệt")
            : confirm.action === "hide"
            ? t("actions.hide", "Ẩn")
            : t("actions.delete", "Xóa")
        }
        danger={confirm.action === "hide" || confirm.action === "delete"}
        onConfirm={doAction}
        onCancel={() => setConfirm({ open: false, action: null, items: [] })}
      />

      {/* Toast */}
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.msg}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </div>
  );
}
