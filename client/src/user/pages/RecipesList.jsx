import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { recipesAPI } from "../../services/recipesAPI.js";
import FilterPanel from "../components/recipes/FilterPanel.jsx";
import SortBar from "../components/recipes/SortBar.jsx";
import RecipeCard from "../components/recipes/RecipeCard.jsx";
import LoadMore from "../components/recipes/LoadMore.jsx";

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl overflow-hidden bg-white border border-emerald-900/10 p-4 space-y-3"
        >
          <div className="h-48 rounded-xl bg-emerald-900/10" />
          <div className="h-4 w-3/4 rounded bg-emerald-900/10" />
          <div className="h-3 w-1/2 rounded bg-emerald-900/10" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-emerald-800/60">
        Không thể tải danh sách công thức
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
      >
        Thử lại
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-emerald-800/60">Không tìm thấy công thức nào</div>
    </div>
  );
}

export default function RecipesList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Filters from URL
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const cursor = searchParams.get("cursor") || "";
  const limit = 12;

  const fetchRecipes = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setRecipes([]); // Clear recipes when applying new filters
      }
      setError(null);

      // Build query parameters
      const options = {
        limit,
        sort,
      };

      // Handle pagination - support both cursor and page-based
      if (loadMore && pagination) {
        if (pagination.nextCursor) {
          // Cursor-based pagination
          options.cursor = pagination.nextCursor;
        } else if (pagination.hasNextPage && pagination.page) {
          // Page-based pagination
          options.page = pagination.page + 1;
        }
      } else if (!loadMore) {
        // Fresh load - reset pagination
        options.page = 1;
      }

      // Add filters if they exist
      if (search) options.search = search;
      if (category) options.category = category;

      const res = await recipesAPI.getRecipes(options);

      console.log("API Response:", res); // Debug log

      // Handle both cursor-based and page-based pagination
      const items = res?.data || res?.recipes || [];
      const pageInfo = res?.pagination || res?.meta || null;

      console.log("Parsed items:", items.length, "pageInfo:", pageInfo); // Debug log

      if (loadMore) {
        // Prevent duplicates when loading more
        setRecipes((prev) => {
          const existingIds = new Set(
            prev.map((recipe) => recipe._id || recipe.id)
          );
          const newItems = items.filter(
            (recipe) => !existingIds.has(recipe._id || recipe.id)
          );
          return [...prev, ...newItems];
        });
      } else {
        setRecipes(items || []);
      }
      setPagination(pageInfo);
    } catch (err) {
      console.error("Error loading recipes:", err);
      setError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreRecipes = () => {
    console.log("Load more clicked:", {
      pagination,
      hasNext: pagination?.hasNext || pagination?.hasNextPage,
      loadingMore,
    });

    // Support both cursor and page-based pagination
    const hasMore =
      pagination &&
      (pagination.hasNext ||
        pagination.hasNextPage ||
        (pagination.page && pagination.page < pagination.totalPages));

    if (hasMore && !loadingMore) {
      fetchRecipes(true);
    }
  };

  useEffect(() => {
    fetchRecipes(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, String(value));
    else newParams.delete(key);
    // Reset cursor when changing filters
    newParams.delete("cursor");
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams({ sort })); // Keep only sort
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 bg-clip-text text-transparent">
          Tất cả công thức
        </h1>
        <p className="text-sm text-emerald-800/70">
          Khám phá & lọc theo nhu cầu của bạn.
        </p>
      </header>

      {/* Filter Panel */}
      <FilterPanel
        search={search}
        onSearch={(value) => updateFilter("search", value)}
        category={category}
        onCategory={(value) => updateFilter("category", value)}
        total={pagination?.total || pagination?.totalCount || 0}
        onClearAll={clearAllFilters}
      />

      {/* Sort Bar */}
      <SortBar
        sort={sort}
        onSort={(value) => updateFilter("sort", value)}
        total={pagination?.total || pagination?.totalCount || 0}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState onRetry={() => fetchRecipes(false)} />
      ) : recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Recipes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recipes.map((recipe, index) => (
              <RecipeCard
                key={`recipe-${
                  recipe._id || recipe.id || recipe.slug || index
                }`}
                recipe={recipe}
              />
            ))}
          </div>

          {/* Load More */}
          <LoadMore
            pagination={pagination}
            loading={loadingMore}
            onLoadMore={loadMoreRecipes}
            className="pt-8"
          />
        </>
      )}
    </div>
  );
}
