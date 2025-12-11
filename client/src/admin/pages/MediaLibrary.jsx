/** MediaLibrary Page - API Integration
 * Features:
 *  - Real API integration with storage backend
 *  - Upload mode: local or S3 (env VITE_UPLOAD_MODE)
 *  - Filter by type, search, tags, uploader
 *  - Multi-select & bulk delete
 *  - Edit alt text and tags
 *  - Upload progress tracking
 */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import MediaGrid from "../components/media/MediaGrid.jsx";
import UploadModal from "../components/media/UploadModal.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import SearchInput from "../components/SearchInput.jsx";
import Toast from "../components/Toast.jsx";
import { t } from "../../i18n";

export default function MediaLibrary() {
  const adminApi = useAdminApi();

  // UI State
  // Grid-only view
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [preview, setPreview] = useState({ open: false, item: null });

  // Data State
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    cursor: null,
    limit: 18, // Changed from 24 to 18
    hasNext: false,
  });

  // Toast State
  const [toast, setToast] = useState({ open: false, msg: "", type: "info" });

  // Get upload mode from environment
  const uploadMode = import.meta.env.VITE_UPLOAD_MODE || "local";

  // Helper functions
  const showToast = (msg, type = "info") => {
    setToast({ open: true, msg, type });
  };

  // Load media from API
  const loadMedia = useCallback(
    async (resetCursor = false) => {
      if (resetCursor) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const params = {
        limit: pagination.limit,
      };

      if (!resetCursor && pagination.cursor) {
        params.cursor = pagination.cursor;
      }

      if (typeFilter !== "all") {
        params.type = typeFilter;
      }

      if (query.trim()) {
        params.search = query.trim();
      }

      const result = await adminApi.safeApiCall(
        () => adminApi.getMedia(params),
        {
          defaultErrorMessage: "Không thể tải thư viện media",
        }
      );

      if (result.success) {
        const responseData = result.data?.data || result.data || {};
        const newItems = (responseData.items || [])
          .filter((item) => item && (item.id || item._id))
          .map((item) => ({
            ...item,
            id: item.id || item._id, // Normalize id field
          }));

        if (resetCursor) {
          setData(newItems);
        } else {
          setData((prev) => [...prev, ...newItems]);
        }

        setTotal(responseData.total || 0);
        setPagination((prev) => ({
          ...prev,
          cursor:
            responseData.pageInfo?.nextCursor || responseData.cursor || null,
          hasNext:
            responseData.pageInfo?.hasNext || responseData.hasNext || false,
        }));
      } else {
        showToast("Không thể tải thư viện media", "error");
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [adminApi, pagination.cursor, pagination.limit, typeFilter, query]
  );

  // Load data on mount and when filters change
  useEffect(() => {
    loadMedia(true); // Reset cursor when filters change
  }, [typeFilter, query]);

  // Filtered data for display (local filtering on loaded data)
  const list = useMemo(() => {
    return data; // API already handles filtering
  }, [data]);

  // Event handlers
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUploadSuccess = (newItems) => {
    // Add new items to the beginning of the list
    setData((prev) => [...newItems, ...prev]);
    setTotal((prev) => prev + newItems.length);
    showToast(`Đã tải lên ${newItems.length} file thành công`, "success");
    setUploadOpen(false);
  };

  const handleUpdateMedia = async (id, updates) => {
    const result = await adminApi.safeApiCall(
      () => adminApi.updateMedia(id, updates),
      {
        defaultErrorMessage: "Không thể cập nhật media",
      }
    );

    if (result.success) {
      const updatedMedia = result.data?.data || result.data;
      setData((prev) =>
        prev.map((item) =>
          item.id === id || item._id === id
            ? { ...item, ...updatedMedia }
            : item
        )
      );
      showToast("Đã cập nhật thành công", "success");
    } else {
      showToast(result.error?.message || "Không thể cập nhật media", "error");
    }
  };

  const handleDeleteSelected = async () => {
    if (selected.length === 0) return;

    const result = await adminApi.safeApiCall(
      () => adminApi.bulkDeleteMedia(selected),
      {
        defaultErrorMessage: "Không thể xóa media",
      }
    );

    if (result.success) {
      setData((prev) =>
        prev.filter((item) => !selected.includes(item.id || item._id))
      );
      setTotal((prev) => prev - selected.length);
      setSelected([]);
      showToast(`Đã xóa ${selected.length} file`, "success");
    } else {
      showToast(result.error?.message || "Không thể xóa media", "error");
    }

    setConfirm(false);
  };

  const loadMore = () => {
    if (pagination.hasNext && !loadingMore) {
      loadMedia(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-emerald-900">
          {t("media.library")}
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Grid-only; removed list toggle */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-emerald-900/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            <option value="all">{t("media.allTypes")}</option>
            <option value="image">{t("media.image")}</option>
            <option value="video">{t("media.video")}</option>
          </select>
          <div className="w-52">
            <SearchInput
              value={query}
              onChange={setQuery}
              onSubmit={setQuery}
              placeholder={t("common.search", "Tìm kiếm") + " media..."}
            />
          </div>
          <button className="btn-brand" onClick={() => setUploadOpen(true)}>
            {t("actions.upload")}
          </button>
          {selected.length > 0 && (
            <button
              onClick={() => setConfirm(true)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-rose-600 text-white shadow-sm hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-lime-400"
            >
              {t("actions.delete")} ({selected.length})
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl h-32 bg-white border border-emerald-900/10 animate-pulse"
            />
          ))}
        </div>
      ) : list.length ? (
        <>
          <MediaGrid
            items={list}
            selectedIds={selected}
            onSelectToggle={toggleSelect}
            onUpdateMedia={handleUpdateMedia}
            onPreview={(it) => setPreview({ open: true, item: it })}
          />

          {/* Load More Button */}
          {pagination.hasNext && (
            <div className="text-center pt-6">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loadingMore ? "Đang tải..." : "Tải thêm"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-20 text-center text-sm text-emerald-800/70 bg-white rounded-2xl border border-emerald-900/15">
          {t("media.noMedia")}
        </div>
      )}

      {selected.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white border border-emerald-900/15 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-4 z-40">
          <span className="text-sm font-medium text-emerald-900">
            {selected.length} {t("table.selected", "selected")}
          </span>
          <button
            onClick={() => setSelected([])}
            className="text-xs text-emerald-700 hover:underline"
          >
            {t("table.clear", "Clear")}
          </button>
        </div>
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        uploadMode={uploadMode}
        adminApi={adminApi}
        showToast={showToast}
      />

      <ConfirmModal
        open={confirm}
        title={t("media.deleteMedia")}
        message={t(
          "media.deleteConfirm",
          `Xóa ${selected.length} mục?`
        ).replace("{count}", selected.length)}
        onConfirm={handleDeleteSelected}
        onCancel={() => setConfirm(false)}
        confirmLabel={t("actions.delete")}
        danger
      />

      {/* Preview Modal */}
      {preview.open && preview.item && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[85vh] overflow-hidden m-4">
            <div className="p-3 border-b border-emerald-900/15 flex items-center justify-between">
              <div className="text-sm font-medium text-emerald-900 truncate pr-3">
                {preview.item.originalName || preview.item.filename}
              </div>
              <button
                onClick={() => setPreview({ open: false, item: null })}
                className="px-3 py-1.5 rounded-lg text-sm bg-white border border-emerald-900/15 hover:bg-emerald-50"
              >
                Đóng
              </button>
            </div>
            <div className="bg-black flex items-center justify-center">
              {preview.item.type === "video" ? (
                <video
                  controls
                  className="w-full max-h-[80vh]"
                  poster={preview.item.thumbnailUrl || undefined}
                >
                  <source src={preview.item.url} type={preview.item.mimeType} />
                  Trình duyệt không hỗ trợ video.
                </video>
              ) : (
                <img
                  src={preview.item.url}
                  alt={preview.item.alt || preview.item.originalName}
                  className="w-full h-auto max-h-[80vh] object-contain bg-black"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.textContent =
                      "Không thể tải ảnh";
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

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
