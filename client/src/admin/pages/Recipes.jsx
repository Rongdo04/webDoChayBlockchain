import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminApi } from "../contexts/AdminApiContext.jsx";
import DataTable from "../components/DataTable.jsx";
import SearchInput from "../components/SearchInput.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import EmptyError from "../components/EmptyError.jsx";
import { TableSkeleton } from "../components/Skeletons.jsx";
import { t } from "../../i18n";

export default function RecipesPage() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const adminApi = useAdminApi();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  });

  // Filter data state
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [authors, setAuthors] = useState([]);

  // UI states
  const [bulkIds, setBulkIds] = useState(null);
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    ids: [],
  });

  // ---- Media modal states (copy pattern from RecipeMediaStep)
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaQuery, setMediaQuery] = useState("");
  const [targetRecipe, setTargetRecipe] = useState(null);

  // URL params helpers
  const getParamsFromURL = useCallback(() => {
    return {
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
      author: searchParams.get("author") || "",
      tag: searchParams.get("tag") || "",
      category: searchParams.get("category") || "",
      dateFrom: searchParams.get("dateFrom") || "",
      dateTo: searchParams.get("dateTo") || "",
      sort: searchParams.get("sort") || "updatedAt",
      direction: searchParams.get("direction") || "desc",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    };
  }, [searchParams]);

  const updateURLParams = useCallback(
    (params) => {
      const newParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "" && value !== "1" && key !== "limit") {
          newParams.set(key, value.toString());
        }
        if (key === "page" && value > 1) newParams.set(key, value.toString());
        if (key === "limit" && value !== 10)
          newParams.set(key, value.toString());
      });
      setSearchParams(newParams, { replace: true });
    },
    [setSearchParams]
  );

  // Load filter data
  const loadFilterData = useCallback(async () => {
    try {
      // Load categories
      const categoriesResult = await adminApi.safeApiCall(
        () => adminApi.getCategories({ limit: 100 }),
        { defaultErrorMessage: "Không thể tải danh mục" }
      );
      if (categoriesResult.success) {
        setCategories(categoriesResult.data?.items || []);
      } else {
        console.error("Failed to load categories:", categoriesResult.error);
      }

      // Load tags
      const tagsResult = await adminApi.safeApiCall(
        () => adminApi.getTags({ limit: 100 }),
        { defaultErrorMessage: "Không thể tải thẻ" }
      );
      if (tagsResult.success) {
        setTags(tagsResult.data?.items || []);
      } else {
        console.error("Failed to load tags:", tagsResult.error);
      }

      // Load authors (from users)
      console.log("Loading users for authors filter..."); // Debug
      const authorsResult = await adminApi.safeApiCall(
        () => adminApi.getUsers({ limit: 100 }),
        { defaultErrorMessage: "Không thể tải tác giả" }
      );
      console.log("Users API result:", authorsResult); // Debug
      if (authorsResult.success) {
        const authorsList =
          authorsResult.data?.data?.items ||
          authorsResult.data?.users ||
          authorsResult.data ||
          [];
        console.log("Authors list processed:", authorsList); // Debug
        setAuthors(authorsList);
      } else {
        console.error("Failed to load authors:", authorsResult.error);
      }
    } catch (error) {
      console.error("Failed to load filter data:", error);
    }
  }, [adminApi]);

  // Load recipes
  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const params = getParamsFromURL();

    const result = await adminApi.safeApiCall(
      () => adminApi.getRecipes(params),
      { defaultErrorMessage: "Không thể tải danh sách công thức" }
    );

    if (result.success) {
      // API: { items, pageInfo: { currentPage, totalPages, hasNext, hasPrev }, total }
      const responseData = result.data || { items: [], pageInfo: {}, total: 0 };
      setData(responseData.items || []);
      setTotal(responseData.total ?? (responseData.items?.length || 0));
      setPagination({
        page: responseData.pageInfo?.currentPage || params.page,
        limit: params.limit,
        hasNext: !!responseData.pageInfo?.hasNext,
        hasPrev: !!responseData.pageInfo?.hasPrev,
      });
    } else {
      setError(result.error?.message || "Đã xảy ra lỗi");
    }

    setLoading(false);
  }, [adminApi, getParamsFromURL]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  // Load filter data on mount
  useEffect(() => {
    loadFilterData();
  }, [loadFilterData]);

  // Search/Filter/Sort/Pagination handlers
  const handleSearch = useCallback(
    (query) => {
      const params = { ...getParamsFromURL(), search: query, page: 1 };
      updateURLParams(params);
    },
    [getParamsFromURL, updateURLParams]
  );

  const handleFilterChange = useCallback(
    (filters) => {
      updateURLParams({ ...getParamsFromURL(), ...filters, page: 1 });
    },
    [getParamsFromURL, updateURLParams]
  );

  const handleSortChange = useCallback(
    (sort) => {
      updateURLParams({
        ...getParamsFromURL(),
        sort: sort.id,
        direction: sort.direction,
        page: 1,
      });
    },
    [getParamsFromURL, updateURLParams]
  );

  const handlePageChange = useCallback(
    (page) => {
      updateURLParams({ ...getParamsFromURL(), page });
    },
    [getParamsFromURL, updateURLParams]
  );

  // ---- Media helpers (reuse RecipeMediaStep behaviors)
  const getMediaUrl = (m) => m?.thumbnailUrl || m?.url || null;
  const openMediaFor = (recipe) => {
    setTargetRecipe(recipe);
    setMediaOpen(true);
  };
  const closeMedia = () => {
    setMediaOpen(false);
    setTargetRecipe(null);
  };

  const loadMedia = async () => {
    setMediaLoading(true);
    try {
      const params = { type: "image", limit: 50 };
      if (mediaQuery.trim()) params.search = mediaQuery.trim();

      const result = await adminApi.safeApiCall(
        () => adminApi.getMedia(params),
        { defaultErrorMessage: "Không thể tải thư viện media" }
      );

      if (result.success) {
        const responseData = result.data?.data || result.data || {};
        let items = [];
        if (responseData.items) items = responseData.items;
        else if (Array.isArray(responseData)) items = responseData;
        else if (responseData.data && Array.isArray(responseData.data))
          items = responseData.data;

        items = items
          .filter((item) => item && (item.id || item._id))
          .map((item) => ({ ...item, id: item.id || item._id }));

        setMediaList(items);
      }
    } finally {
      setMediaLoading(false);
    }
  };

  useEffect(() => {
    if (mediaOpen) loadMedia();
  }, [mediaOpen]);
  useEffect(() => {
    if (!mediaOpen) return;
    const tId = setTimeout(loadMedia, 300);
    return () => clearTimeout(tId);
  }, [mediaQuery, mediaOpen]);

  const applyCover = async (media) => {
    if (!targetRecipe || !media) return;

    // Send just the Media ObjectId - backend will populate it properly
    const mediaId = media._id || media.id;

    const result = await adminApi.safeApiCall(
      () => adminApi.updateRecipe(targetRecipe._id, { images: [mediaId] }),
      { defaultErrorMessage: "Không thể cập nhật ảnh công thức" }
    );
    if (result.success) {
      await loadRecipes();
      closeMedia();
    }
  };

  // Current params for table
  const currentParams = useMemo(() => getParamsFromURL(), [getParamsFromURL]);
  const currentSort = useMemo(
    () => ({ id: currentParams.sort, direction: currentParams.direction }),
    [currentParams]
  );
  const currentFilters = useMemo(
    () => ({
      status: currentParams.status,
      author: currentParams.author,
      tag: currentParams.tag,
      category: currentParams.category,
      dateFrom: currentParams.dateFrom,
      dateTo: currentParams.dateTo,
    }),
    [currentParams]
  );

  // Filter options with API data
  const facetDefs = useMemo(
    () => [
      {
        id: "status",
        label: t("table.status", "Trạng thái"),
        type: "chips",
        options: [
          { value: "draft", label: t("status.draft", "Nháp") },
          { value: "review", label: t("status.review", "Chờ duyệt") },
          { value: "published", label: t("status.published", "Đã xuất bản") },
          { value: "rejected", label: t("status.rejected", "Từ chối") },
        ],
      },
      {
        id: "author",
        label: t("table.author", "Tác giả"),
        type: "select",
        options: [
          ...(Array.isArray(authors)
            ? authors.map((author) => ({
                value: author._id || author.id,
                label: author.name || author.username || "Unknown",
              }))
            : []),
        ],
      },
      {
        id: "category",
        label: t("common.category", "Danh mục"),
        type: "select",
        options: [
          { value: "", label: "Tất cả danh mục" },
          ...(Array.isArray(categories)
            ? categories.map((category) => ({
                value: category._id || category.id,
                label: category.name,
              }))
            : []),
        ],
      },
      {
        id: "tag",
        label: t("common.tag", "Thẻ"),
        type: "select",
        options: [
          { value: "", label: "Tất cả thẻ" },
          ...(Array.isArray(tags)
            ? tags.map((tag) => ({
                value: tag._id || tag.id,
                label: tag.name,
              }))
            : []),
        ],
      },
    ],
    [categories, tags, authors]
  );

  // Helper function to get image URL from various possible data structures
  const getImageUrl = (row) => {
    if (!row) return null;

    // Case 1: images array with populated Media objects
    if (row.images && Array.isArray(row.images) && row.images.length > 0) {
      const firstImage = row.images[0];
      if (typeof firstImage === "string") {
        // Case 1a: images is array of URL strings (legacy)
        return firstImage;
      } else if (firstImage && typeof firstImage === "object") {
        // Case 1b: images is array of Media objects (populated)
        return firstImage.thumbnailUrl || firstImage.url || null;
      }
    }

    // Case 2: single image field (legacy or different structure)
    if (row.image) {
      if (typeof row.image === "string") {
        return row.image;
      } else if (row.image.url) {
        return row.image.url;
      }
    }

    // Case 3: coverImage field (alternative naming)
    if (row.coverImage) {
      if (typeof row.coverImage === "string") {
        return row.coverImage;
      } else if (row.coverImage.url) {
        return row.coverImage.url;
      }
    }

    return null;
  };

  // Columns (image cell mimics RecipeMediaStep thumbnail)
  const columns = useMemo(
    () => [
      {
        id: "thumb",
        header: t("table.thumb", "Ảnh"),
        cell: (_, row) => {
          const imageUrl = getImageUrl(row);
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openMediaFor(row)}
                title={t("recipes.changeCover", "Đổi ảnh")}
                className="w-12 h-12 rounded-lg overflow-hidden bg-emerald-900/10 flex items-center justify-center text-[10px] font-medium text-emerald-700 hover:ring-2 hover:ring-emerald-500 transition"
              >
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={row.title || "thumbnail"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Image load error for URL:", imageUrl);
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.textContent = "IMG";
                    }}
                  />
                ) : (
                  "IMG"
                )}
              </button>
              <button
                type="button"
                onClick={() => openMediaFor(row)}
                className="px-2 py-1 rounded-lg bg-white border border-emerald-900/15 text-xs text-emerald-900 hover:bg-emerald-50"
              >
                {t("recipes.changeCover", "Đổi ảnh")}
              </button>
            </div>
          );
        },
      },
      {
        id: "title",
        header: t("table.title", "Tiêu đề"),
        sortable: true,
        accessor: (row) => row.title || "—",
      },
      {
        id: "author",
        header: t("table.author", "Tác giả"),
        accessor: (r) =>
          r.authorId?.name || r.author?.name || r.authorName || "—",
        sortable: true,
      },
      {
        id: "status",
        header: t("table.status", "Trạng thái"),
        accessor: (r) => r.status,
        cell: (status) => {
          const map = {
            published: {
              label: t("status.published", "Đã xuất bản"),
              className: "bg-green-100 text-green-800",
            },
            draft: {
              label: t("status.draft", "Bản nháp"),
              className: "bg-gray-100 text-gray-800", // Màu xám cho nháp
            },
            pending: {
              label: t("status.pending", "Chờ duyệt"),
              className: "bg-yellow-100 text-yellow-800", // Nền vàng cho chờ duyệt
            },
            review: {
              label: t("status.review", "Chờ duyệt"),
              className: "bg-yellow-100 text-yellow-800", // Nền vàng cho chờ duyệt (alias)
            },
            rejected: {
              label: t("status.rejected", "Bị từ chối"),
              className: "bg-red-100 text-red-800",
            },
          };
          const cfg = map[status] || {
            label: status,
            className: "bg-gray-100 text-gray-800",
          };
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.className}`}
            >
              {cfg.label}
            </span>
          );
        },
      },
      {
        id: "updatedAt",
        header: t("table.updated", "Cập nhật"),
        sortable: true,
        accessor: (r) => r.updatedAt || r.updated_at,
        cell: (v) => (
          <span
            className="text-xs text-emerald-800/80"
            title={v ? new Date(v).toLocaleString() : ""}
          >
            {v ? new Date(v).toLocaleDateString("vi-VN") : "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: t("table.actions", "Hành động"),
        cell: (_, row) => (
          <div className="flex items-center gap-2">
            <button
              className="text-xs px-2 py-1 text-emerald-700 hover:bg-emerald-50 rounded"
              onClick={() => nav(`/admin/recipes/${row._id}/edit`)}
            >
              {t("actions.edit", "Sửa")}
            </button>
            <button
              className="text-xs px-2 py-1 text-rose-600 hover:bg-rose-50 rounded"
              onClick={() => openConfirm("delete", [row._id])}
            >
              {t("actions.delete", "Xóa")}
            </button>
          </div>
        ),
      },
    ],
    [nav]
  );

  // Bulk actions
  const handleBulkAction = useCallback(
    async (action, ids) => {
      setLoading(true);
      setError(null);
      let result;
      if (action === "publish") {
        result = await adminApi.safeApiCall(
          () => adminApi.bulkUpdateRecipes({ ids, status: "published" }),
          { defaultErrorMessage: "Không thể cập nhật trạng thái công thức" }
        );
      } else if (action === "unpublish") {
        result = await adminApi.safeApiCall(
          () => adminApi.bulkUpdateRecipes({ ids, status: "draft" }),
          { defaultErrorMessage: "Không thể cập nhật trạng thái công thức" }
        );
      } else if (action === "delete") {
        result = await adminApi.safeApiCall(
          () => adminApi.bulkDeleteRecipes({ ids }),
          { defaultErrorMessage: "Không thể xóa công thức" }
        );
      } else {
        setLoading(false);
        return;
      }
      if (result.success) await loadRecipes();
      else setError(result.error?.message || "Đã xảy ra lỗi");
      setLoading(false);
      setBulkIds(null);
    },
    [adminApi, loadRecipes]
  );

  const openConfirm = (action, ids) => setConfirm({ open: true, action, ids });
  const closeConfirm = () => setConfirm({ open: false, action: null, ids: [] });
  const executeConfirm = () => {
    handleBulkAction(confirm.action, confirm.ids);
    closeConfirm();
  };

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold text-emerald-900">
          {t("nav.recipes", "Quản lý công thức")}
        </h2>
        <div className="flex items-center gap-3">
          <button
            className="btn-brand"
            onClick={() => nav("/admin/recipes/new")}
          >
            {t("actions.create", "Tạo mới")}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
          <div className="w-full max-w-sm">
            <SearchInput
              value={currentParams.search}
              onChange={handleSearch}
              onSubmit={handleSearch}
              placeholder={t(
                "table.searchPlaceholder",
                "Tìm kiếm theo tiêu đề..."
              )}
            />
          </div>
          <Filters
            facets={facetDefs}
            values={currentFilters}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {/* States */}
      {loading && <TableSkeleton rows={5} cols={6} />}

      {!loading && error && (
        <EmptyError
          variant="error"
          title={t("common.error", "Lỗi")}
          message={error}
          actionLabel={t("common.retry", "Thử lại")}
          onAction={loadRecipes}
        />
      )}

      {!loading && !error && (
        <>
          {data.length === 0 ? (
            <EmptyError
              variant="empty"
              title={t("common.noData", "Không có công thức")}
              message={t(
                "recipes.emptyMessage",
                "Thử điều chỉnh bộ lọc hoặc tạo công thức mới."
              )}
              actionLabel={t("actions.create", "Tạo mới")}
              onAction={() => nav("/admin/recipes/new")}
            />
          ) : (
            <>
              <DataTable
                columns={columns}
                rows={data}
                selectable
                sort={{
                  id: currentParams.sort,
                  direction: currentParams.direction,
                }}
                onSortChange={handleSortChange}
                onBulkAction={(ids) => setBulkIds(ids)}
              />

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
            </>
          )}
        </>
      )}

      {/* Bulk action bar */}
      {bulkIds && bulkIds.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white border border-emerald-900/15 shadow-lg rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium text-emerald-900">
            {bulkIds.length} {t("table.selected", "đã chọn")}
          </span>
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-lime-400"
            onClick={() => handleBulkAction("publish", bulkIds)}
          >
            {t("actions.publish", "Xuất bản")}
          </button>
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-900/10 text-emerald-900 hover:bg-emerald-900/20 focus:outline-none focus:ring-2 focus:ring-lime-400"
            onClick={() => handleBulkAction("unpublish", bulkIds)}
          >
            {t("actions.unpublish", "Hủy xuất bản")}
          </button>
          <button
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-500 focus:outline-none focus:ring-2 focus:ring-lime-400 shadow-sm"
            onClick={() => openConfirm("delete", bulkIds)}
          >
            {t("actions.delete", "Xóa")}
          </button>
          <button
            className="ml-auto text-xs text-emerald-700 hover:underline"
            onClick={() => setBulkIds(null)}
          >
            {t("actions.close", "Đóng")}
          </button>
        </div>
      )}

      {/* Confirm delete */}
      {confirm.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-md w-full m-4 border border-emerald-900/15 shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                Xác nhận {confirm.action === "delete" ? "xóa" : confirm.action}
              </h3>
              <p className="text-sm text-emerald-700 mb-6">
                {confirm.action === "delete"
                  ? `Bạn có chắc chắn muốn xóa ${confirm.ids.length} công thức? Hành động này không thể hoàn tác.`
                  : `Bạn có chắc chắn muốn ${confirm.action} ${confirm.ids.length} công thức?`}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={executeConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 ${
                    confirm.action === "delete"
                      ? "bg-red-600 hover:bg-red-700 focus:ring-red-400"
                      : "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400"
                  }`}
                >
                  {confirm.action === "delete" ? "Xóa" : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Media Selection Modal (same UX as RecipeMediaStep) */}
      {mediaOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden m-4 border border-emerald-900/15 shadow-xl">
            <div className="p-4 border-b border-emerald-900/15 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-emerald-900">
                {t("recipes.pickCover", "Chọn ảnh đại diện")}
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  value={mediaQuery}
                  onChange={(e) => setMediaQuery(e.target.value)}
                  placeholder={t("common.search", "Tìm kiếm...")}
                  className="input w-64"
                  aria-label="Tìm media"
                />
                <button
                  type="button"
                  onClick={closeMedia}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50"
                >
                  {t("actions.close", "Đóng")}
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-[70vh]">
              {mediaLoading && (
                <p className="text-center py-4 text-emerald-800/70">
                  {t("common.loading", "Đang tải...")}
                </p>
              )}
              {!mediaLoading && mediaList.length === 0 && (
                <p className="text-center py-8 text-emerald-800/70">
                  {t("common.noData", "Không có ảnh nào")}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {mediaList.map((m) => {
                  const url = getMediaUrl(m);
                  return (
                    <div
                      key={m.id}
                      className="relative cursor-pointer group"
                      onClick={() => applyCover(m)}
                      title={t("recipes.useThis", "Dùng ảnh này")}
                    >
                      <div className="aspect-video rounded-xl overflow-hidden bg-emerald-900/10 group-hover:ring-2 group-hover:ring-emerald-500 transition-all flex items-center justify-center text-[10px] font-medium text-emerald-700">
                        {url ? (
                          <img
                            src={url}
                            alt={m.alt || m.originalName || "media"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.textContent =
                                m.type === "video" ? "VIDEO" : "IMG";
                            }}
                          />
                        ) : m.type === "video" ? (
                          "VIDEO"
                        ) : (
                          "IMG"
                        )}
                      </div>
                      <p className="text-xs text-emerald-800/70 mt-1 truncate">
                        {m.originalName || "Untitled"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
