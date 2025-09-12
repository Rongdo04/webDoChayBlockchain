import React from "react";

export default function LoadMore({
  pagination,
  loading,
  onLoadMore,
  className = "",
}) {
  if (!pagination) return null;

  // Support both cursor and page-based pagination
  const hasMore =
    pagination.hasNext ||
    pagination.hasNextPage ||
    (pagination.page && pagination.page < pagination.totalPages);

  const currentCount =
    pagination.currentCount ||
    pagination.count ||
    (pagination.page && pagination.limit
      ? pagination.page * pagination.limit
      : 0);

  const totalCount = pagination.totalCount || pagination.total || 0;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Progress indicator */}
      {totalCount > 0 && (
        <div className="w-full max-w-md">
          <div className="flex justify-between text-xs text-emerald-800/60 mb-1">
            <span>
              Đã hiển thị {Math.min(currentCount, totalCount)} trên {totalCount}
            </span>
            <span>
              {Math.round(
                (Math.min(currentCount, totalCount) / totalCount) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-1.5">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((currentCount / totalCount) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Load more button */}
      {hasMore && (
        <button
          onClick={onLoadMore}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang tải...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Tải thêm</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          )}
        </button>
      )}

      {/* End message */}
      {!hasMore && currentCount > 0 && (
        <div className="text-center py-4">
          <div className="text-sm text-emerald-800/60">
            🎉 Bạn đã xem hết tất cả công thức!
          </div>
          <div className="text-xs text-emerald-800/40 mt-1">
            Tổng cộng {totalCount} công thức
          </div>
        </div>
      )}
    </div>
  );
}
