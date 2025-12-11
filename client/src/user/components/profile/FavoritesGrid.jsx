import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import RecipeCard from "../RecipeCard";
import { useErrorHandler } from "../../../hooks/useErrorHandler.js";
import {
  ErrorState,
  LoadingState,
  EmptyState,
} from "../../../components/common/ErrorState.jsx";

export default function FavoritesGrid({ userId }) {
  const { error, loading, executeWithErrorHandling, clearError } =
    useErrorHandler();
  const [favorites, setFavorites] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    sort: "newest",
  });

  // Load favorites from localStorage first, then try API
  const loadFavorites = async () => {
    await executeWithErrorHandling(
      async () => {
        // Try to load from localStorage first
        const localFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );

        if (localFavorites.length > 0) {
          // Load recipe details for local favorites
          const recipePromises = localFavorites.map(async (recipeId) => {
            try {
              // Sử dụng URL trực tiếp vì không có proxy
              const url = `http://localhost:8000/api/recipes/${recipeId}`;

              console.log(`[Favorites] Loading recipe ${recipeId} from:`, url);
              const response = await fetch(url, {
                headers: { Accept: "application/json" },
                credentials: "include",
              });

              const contentType = response.headers.get("content-type") || "";
              const raw = await response.text();

              if (!response.ok) {
                throw new Error(
                  `HTTP ${response.status} ${
                    response.statusText
                  } — body: ${raw.slice(0, 200)}`
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
              return data.data || null; // API recipes trả về {data: {...}} không có field success
            } catch (error) {
              console.error(`Error loading recipe ${recipeId}:`, error);
              return null;
            }
          });

          const recipes = (await Promise.all(recipePromises)).filter(Boolean);
          setFavorites(recipes);
          setPagination((prev) => ({
            ...prev,
            total: recipes.length,
            totalPages: Math.ceil(recipes.length / prev.limit),
          }));
        } else {
          // Try API if no local favorites
          try {
            const params = new URLSearchParams({
              page: pagination.page,
              limit: pagination.limit,
              sort: filters.sort,
            });

            if (filters.search) params.append("search", filters.search);

            // Sử dụng URL trực tiếp vì không có proxy
            const url = `http://localhost:8000/api/users/me/favorites?${params}`;

            console.log(`[Favorites] Loading from API:`, url);
            const response = await fetch(url, {
              headers: { Accept: "application/json" },
              credentials: "include",
            });

            const contentType = response.headers.get("content-type") || "";
            const raw = await response.text();

            if (!response.ok) {
              throw new Error(
                `HTTP ${response.status} ${
                  response.statusText
                } — body: ${raw.slice(0, 200)}`
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

            if (data.success) {
              setFavorites(data.data.recipes || []);
              setPagination((prev) => ({
                ...prev,
                total: data.data.total || 0,
                totalPages: data.data.totalPages || 0,
              }));
            }
          } catch (apiError) {
            console.log("API favorites not available, using localStorage only");
            setFavorites([]);
            setPagination((prev) => ({
              ...prev,
              total: 0,
              totalPages: 0,
            }));
          }
        }
      },
      {
        onSuccess: () => clearError(),
      }
    );
  };

  useEffect(() => {
    loadFavorites();
  }, [userId, pagination.page, filters]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // Remove from favorites
  const removeFavorite = (recipeId) => {
    const localFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    const updatedFavorites = localFavorites.filter((id) => id !== recipeId);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

    setFavorites((prev) => prev.filter((recipe) => recipe._id !== recipeId));
    setPagination((prev) => ({
      ...prev,
      total: prev.total - 1,
      totalPages: Math.ceil((prev.total - 1) / prev.limit),
    }));
  };

  if (loading) {
    return <LoadingState message="Đang tải công thức yêu thích..." />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        actionLabel="Thử lại"
        onAction={() => loadFavorites()}
      />
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="Chưa có công thức yêu thích"
        message="Bạn chưa thêm công thức nào vào danh sách yêu thích. Hãy khám phá và thêm những món chay ngon!"
        actionLabel="Khám phá công thức"
        onAction={() => (window.location.href = "/recipes")}
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
            placeholder="Tìm kiếm công thức yêu thích..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
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

      {/* Grid */}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <FaHeart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Chưa có công thức yêu thích
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Hãy khám phá và thêm công thức vào danh sách yêu thích của bạn
          </p>
          <div className="mt-6">
            <Link
              to="/recipes"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Khám phá công thức
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onToggleFavorite={removeFavorite}
              isFavorited={true}
            />
          ))}
        </div>
      )}

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
    </div>
  );
}
