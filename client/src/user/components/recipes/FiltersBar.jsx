import React from "react";

export default function FiltersBar({
  query,
  onQuery,
  diet,
  onDiet,
  sort,
  onSort,
  total,
}) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between p-4 rounded-xl border border-emerald-900/10 bg-white shadow-sm">
      <div className="flex flex-1 gap-3">
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Tìm công thức..."
          className="flex-1 px-3 py-2 rounded-lg border border-emerald-900/15 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-emerald-50"
        />
        <select
          value={diet}
          onChange={(e) => onDiet(e.target.value)}
          className="px-3 py-2 rounded-lg border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
          aria-label="Lọc chế độ"
        >
          <option value="">Chế độ (tất cả)</option>
          <option value="Thuần chay">Thuần chay</option>
          <option value="Ovo-lacto">Ovo-lacto</option>
        </select>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="px-3 py-2 rounded-lg border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
          aria-label="Sắp xếp"
        >
          <option value="created-desc">Mới nhất</option>
          <option value="rating-desc">Đánh giá cao</option>
          <option value="time-asc">Thời gian ít</option>
        </select>
      </div>
      <div className="text-[12px] font-medium text-emerald-800/70 whitespace-nowrap">
        {total} kết quả
      </div>
    </div>
  );
}
