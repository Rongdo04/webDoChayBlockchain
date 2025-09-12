/**
 * Pagination Component
 * Props:
 *  - currentPage: number - Current active page (1-based)
 *  - totalItems: number - Total number of items
 *  - itemsPerPage: number - Items per page
 *  - onPageChange: (page: number) => void - Page change handler
 *  - hasNext?: boolean - Whether there's a next page (from API)
 *  - hasPrev?: boolean - Whether there's a previous page (from API)
 *
 * Legacy support for existing props:
 *  - page, pageSize, total, onChange
 */
import React from "react";
import { t } from "../../i18n";

export default function Pagination({
  // New props
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  hasNext,
  hasPrev,
  // Legacy props
  page = 1,
  pageSize = 10,
  total = 0,
  onChange,
}) {
  // Support both new and legacy prop formats
  const activePage = currentPage || page;
  const totalCount = totalItems || total;
  const perPage = itemsPerPage || pageSize;
  const changeHandler =
    onPageChange ||
    ((p) => onChange && onChange({ page: p, pageSize: perPage }));

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const canPrev = hasNext !== undefined ? hasPrev : activePage > 1;
  const canNext = hasNext !== undefined ? hasNext : activePage < totalPages;

  const goto = (p) => {
    if (p < 1 || p > totalPages || p === activePage) return;
    changeHandler(p);
  };

  const startItem = (activePage - 1) * perPage + 1;
  const endItem = Math.min(activePage * perPage, totalCount);

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm">
      <div className="text-emerald-800/70">
        {t("pagination.showing", "Hiển thị")}{" "}
        <strong>
          {startItem}-{endItem}
        </strong>{" "}
        {t("pagination.of", "của")} <strong>{totalCount}</strong>{" "}
        {t("pagination.items", "mục")}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => goto(1)}
          disabled={!canPrev}
          aria-label={t("common.firstPage", "Trang đầu")}
          className="px-2 py-1 rounded-lg border border-emerald-900/15 bg-white disabled:opacity-40 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          «
        </button>
        <button
          onClick={() => goto(activePage - 1)}
          disabled={!canPrev}
          aria-label={t("common.prevPage", "Trang trước")}
          className="px-2 py-1 rounded-lg border border-emerald-900/15 bg-white disabled:opacity-40 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          ‹
        </button>
        <span className="px-2">
          {t("common.page", "Trang")} <strong>{activePage}</strong> /{" "}
          {totalPages}
        </span>
        <button
          onClick={() => goto(activePage + 1)}
          disabled={!canNext}
          aria-label={t("common.nextPage", "Trang sau")}
          className="px-2 py-1 rounded-lg border border-emerald-900/15 bg-white disabled:opacity-40 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          ›
        </button>
        <button
          onClick={() => goto(totalPages)}
          disabled={!canNext}
          aria-label={t("common.lastPage", "Trang cuối")}
          className="px-2 py-1 rounded-lg border border-emerald-900/15 bg-white disabled:opacity-40 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          »
        </button>
      </div>
    </div>
  );
}
