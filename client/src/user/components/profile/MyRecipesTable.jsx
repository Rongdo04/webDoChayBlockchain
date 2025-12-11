import React, { useState, useEffect } from "react";
import { FaEye, FaTrash, FaImage, FaStar } from "react-icons/fa";
import { useErrorHandler, useToast } from "../../../hooks/useErrorHandler.js";
import {
  ErrorState,
  LoadingState,
  EmptyState,
} from "../../../components/common/ErrorState.jsx";
import RecipeViewModal from "./RecipeViewModal.jsx";

export default function MyRecipesTable({ userId }) {
  const { error, loading, executeWithErrorHandling, clearError } =
    useErrorHandler();
  const { toast, showSuccess, showError, closeToast } = useToast();
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    sort: "newest",
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load recipes with error handling
  const loadRecipes = async () => {
    await executeWithErrorHandling(
      async () => {
        const params = new URLSearchParams({
          author: userId,
          page: String(pagination.page),
          limit: String(pagination.limit),
          sort: filters.sort,
        });
        if (filters.status) params.append("status", filters.status);
        if (filters.search) params.append("search", filters.search);

        // Sử dụng URL trực tiếp vì không có proxy
        const url = `http://localhost:8000/api/recipes?${params.toString()}`;

        console.log("[Recipes] GET", url);
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
          credentials: "include",
        });

        const contentType = res.headers.get("content-type") || "";
        const raw = await res.text();

        if (!res.ok) {
          throw new Error(
            `HTTP ${res.status} ${res.statusText} — body: ${raw.slice(0, 200)}`
          );
        }
        if (!contentType.includes("application/json")) {
          throw new Error(
            `Expected JSON, got "${contentType}". Body starts with: ${raw.slice(
              0,
              200
            )}`
          );
        }

        const data = JSON.parse(raw);
        console.log("Response data:", data);

        // API recipes trả về {data: [...], pagination: {...}} không có field success
        if (data?.data && Array.isArray(data.data)) {
          setRecipes(data.data);
          setPagination((prev) => ({
            ...prev,
            total: data.pagination?.total || 0,
            totalPages: data.pagination?.totalPages || 0,
          }));
        } else {
          throw new Error(`API response invalid — ${raw.slice(0, 200)}`);
        }
      },
      {
        onSuccess: () => clearError(),
      }
    );
  };

  useEffect(() => {
    loadRecipes();
  }, [userId, pagination.page, filters]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (showDeleteModal) {
          cancelDelete();
        } else if (showViewModal) {
          setShowViewModal(false);
          setSelectedRecipe(null);
        }
      }
    };

    if (showDeleteModal || showViewModal) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [showDeleteModal, showViewModal]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Handle view recipe
  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowViewModal(true);
  };

  // Handle delete recipe
  const handleDeleteRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!selectedRecipe) return;

    setDeleting(true);
    await executeWithErrorHandling(
      async () => {
        const response = await fetch(
          `http://localhost:8000/api/recipes/${selectedRecipe._id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        // Remove from local state
        setRecipes((prev) =>
          prev.filter((recipe) => recipe._id !== selectedRecipe._id)
        );
        setPagination((prev) => ({
          ...prev,
          total: prev.total - 1,
          totalPages: Math.ceil((prev.total - 1) / prev.limit),
        }));

        // Close modal
        setShowDeleteModal(false);
        setSelectedRecipe(null);
      },
      {
        showLoading: false, // We handle loading state manually
        onSuccess: () => {
          setDeleting(false);
          showSuccess("Đã xóa công thức thành công!", "Xóa công thức");
        },
        onError: (error) => {
          setDeleting(false);
          showError(error, "Lỗi xóa công thức");
          console.error("Error deleting recipe:", error);
        },
      }
    );
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedRecipe(null);
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    const styles = {
      draft: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      published: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      scheduled: "bg-blue-100 text-blue-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  // Get status label
  const getStatusLabel = (status) => {
    const labels = {
      draft: "Bản nháp",
      pending: "Chờ duyệt",
      published: "Đã xuất bản",
      rejected: "Bị từ chối",
      scheduled: "Lên lịch",
    };
    return labels[status] || status;
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingState message="Đang tải công thức..." />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        actionLabel="Thử lại"
        onAction={() => loadRecipes()}
      />
    );
  }

  if (recipes.length === 0) {
    return (
      <EmptyState
        title="Chưa có công thức"
        message="Bạn chưa tạo công thức nào. Hãy bắt đầu chia sẻ món chay của bạn!"
        actionLabel="Tạo công thức"
        onAction={() => (window.location.href = "/submit")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Tìm kiếm công thức..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => handleFilterChange("status", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="pending">Chờ duyệt</option>
          <option value="published">Đã xuất bản</option>
          <option value="rejected">Bị từ chối</option>
          <option value="scheduled">Lên lịch</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="newest">Mới nhất</option>
          <option value="rating">Đánh giá cao</option>
          <option value="time">Thời gian nấu</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Công thức
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đánh giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời gian
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày tạo
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recipes.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  Chưa có công thức nào
                </td>
              </tr>
            ) : (
              recipes.map((recipe) => (
                <tr key={recipe._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        {recipe.images && recipe.images.length > 0 ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={
                              recipe.images[0].thumbnailUrl ||
                              recipe.images[0].url
                            }
                            alt={recipe.title}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.parentElement.innerHTML =
                                '<div class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg></div>';
                            }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FaImage className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {recipe.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {recipe.summary || recipe.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(
                          recipe.status
                        )}`}
                      >
                        {getStatusLabel(recipe.status)}
                      </span>
                      {recipe.status === "rejected" && recipe.rejection?.reason && (
                        <div className="mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-1 max-w-xs">
                          <span className="font-medium">Lý do từ chối: </span>
                          {recipe.rejection.reason}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FaStar className="text-yellow-400" />
                      <span className="ml-1">
                        {recipe.ratingAvg ? recipe.ratingAvg.toFixed(1) : "0.0"}
                      </span>
                      <span className="ml-1 text-gray-500">
                        ({recipe.ratingCount || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recipe.prepTime + recipe.cookTime} phút
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(recipe.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => handleViewRecipe(recipe)}
                        className="text-emerald-600 hover:text-emerald-900 p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                        title="Xem công thức"
                      >
                        <FaEye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa công thức"
                      >
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị{" "}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{" "}
            đến{" "}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{" "}
            trong tổng số{" "}
            <span className="font-medium">{pagination.total}</span> kết quả
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.page
                      ? "bg-emerald-600 text-white"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRecipe && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => e.target === e.currentTarget && cancelDelete()}
        >
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <FaTrash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Xác nhận xóa công thức
              </h3>
              <div className="mt-2 px-7 py-3">
                <div className="flex items-center justify-center mb-3">
                  {selectedRecipe.images && selectedRecipe.images.length > 0 ? (
                    <img
                      src={
                        selectedRecipe.images[0].thumbnailUrl ||
                        selectedRecipe.images[0].url
                      }
                      alt={selectedRecipe.title}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement.innerHTML =
                          '<div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center"><svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg></div>';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FaImage className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Bạn có chắc chắn muốn xóa công thức{" "}
                  <span className="font-medium text-gray-900">
                    "{selectedRecipe.title}"
                  </span>{" "}
                  không?
                  <br />
                  <span className="text-red-600 font-medium">
                    Hành động này không thể hoàn tác.
                  </span>
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={cancelDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang xóa...
                    </>
                  ) : (
                    "Xóa"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe View Modal */}
      <RecipeViewModal
        recipe={selectedRecipe}
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRecipe(null);
        }}
      />

      {/* Toast Notification */}
      {toast.open && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{toast.message}</span>
              <button
                onClick={closeToast}
                className="ml-4 text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
