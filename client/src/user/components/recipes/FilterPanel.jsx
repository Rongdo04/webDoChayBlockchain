import React, { useState, useEffect } from "react";
import { taxonomyAPI } from "../../../services/taxonomyAPI.js";

export default function FilterPanel({
  search,
  onSearch,
  category,
  onCategory,
  total,
  onClearAll,
}) {
  const [categories, setCategories] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await taxonomyAPI.getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const hasActiveFilters = search || category;

  return (
    <div className="bg-white border border-emerald-900/10 rounded-xl shadow-sm">
      {/* Search Bar - Always Visible */}
      <div className="p-4 border-b border-emerald-900/10">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Tìm kiếm công thức..."
            className="flex-1 px-4 py-2 rounded-lg border border-emerald-900/15 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-emerald-50"
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              isExpanded || hasActiveFilters
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            {isExpanded ? "Thu gọn" : "Bộ lọc"}{" "}
            {hasActiveFilters &&
              `(${[search, category].filter(Boolean).length})`}
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible (Category only) */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-emerald-800/70 mb-1">
                Danh mục
              </label>
              <select
                value={category}
                onChange={(e) => onCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center pt-2 border-t border-emerald-900/10">
              <button
                onClick={onClearAll}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Xóa tất cả bộ lọc
              </button>
              <div className="text-xs text-emerald-800/70">{total} kết quả</div>
            </div>
          )}
        </div>
      )}

      {/* Results Count - Always Visible */}
      {!isExpanded && (
        <div className="px-4 py-2 text-xs text-emerald-800/70 text-right border-t border-emerald-900/10">
          {total} kết quả
        </div>
      )}
    </div>
  );
}
