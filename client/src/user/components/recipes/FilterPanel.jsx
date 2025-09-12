import React, { useState, useEffect } from "react";
import { taxonomyAPI } from "../../../services/taxonomyAPI.js";

export default function FilterPanel({
  search,
  onSearch,
  ingredients,
  onIngredients,
  category,
  onCategory,
  dietType,
  onDietType,
  difficulty,
  onDifficulty,
  taste,
  onTaste,
  timeMin,
  onTimeMin,
  timeMax,
  onTimeMax,
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

  const dietTypeOptions = [
    { value: "Thuần chay", label: "Thuần chay" },
    { value: "Ovo-lacto", label: "Ovo-lacto" },
    { value: "Pescatarian", label: "Pescatarian" },
    { value: "Flexitarian", label: "Flexitarian" },
  ];

  const difficultyOptions = [
    { value: "Dễ", label: "Dễ" },
    { value: "Trung bình", label: "Trung bình" },
    { value: "Khó", label: "Khó" },
  ];

  const tasteOptions = [
    { value: "Ngọt", label: "Ngọt" },
    { value: "Mặn", label: "Mặn" },
    { value: "Chua", label: "Chua" },
    { value: "Cay", label: "Cay" },
    { value: "Đắng", label: "Đắng" },
    { value: "Umami", label: "Umami" },
  ];

  const hasActiveFilters =
    search ||
    ingredients ||
    category ||
    dietType ||
    difficulty ||
    taste ||
    timeMin ||
    timeMax;

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
              `(${
                Object.values({
                  search,
                  ingredients,
                  category,
                  dietType,
                  difficulty,
                  taste,
                  timeMin,
                  timeMax,
                }).filter(Boolean).length
              })`}
          </button>
        </div>
      </div>

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Ingredients */}
            <div>
              <label className="block text-xs font-medium text-emerald-800/70 mb-1">
                Nguyên liệu
              </label>
              <input
                type="text"
                value={ingredients}
                onChange={(e) => onIngredients(e.target.value)}
                placeholder="VD: đậu hũ, rau xanh..."
                className="w-full px-3 py-2 rounded-lg border border-emerald-900/15 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
            </div>

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
                  <option key={cat._id || cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Diet Type */}
            <div>
              <label className="block text-xs font-medium text-emerald-800/70 mb-1">
                Chế độ ăn
              </label>
              <select
                value={dietType}
                onChange={(e) => onDietType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">Tất cả chế độ</option>
                {dietTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-medium text-emerald-800/70 mb-1">
                Độ khó
              </label>
              <select
                value={difficulty}
                onChange={(e) => onDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">Tất cả độ khó</option>
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Taste */}
            <div>
              <label className="block text-xs font-medium text-emerald-800/70 mb-1">
                Hương vị
              </label>
              <select
                value={taste}
                onChange={(e) => onTaste(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                <option value="">Tất cả hương vị</option>
                {tasteOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Range */}
            <div>
              <label className="block text-xs font-medium text-emerald-800/70 mb-1">
                Thời gian (phút)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={timeMin || ""}
                  onChange={(e) =>
                    onTimeMin(e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="Từ"
                  min="0"
                  className="flex-1 px-3 py-2 rounded-lg border border-emerald-900/15 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
                <input
                  type="number"
                  value={timeMax || ""}
                  onChange={(e) =>
                    onTimeMax(e.target.value ? parseInt(e.target.value) : null)
                  }
                  placeholder="Đến"
                  min="0"
                  className="flex-1 px-3 py-2 rounded-lg border border-emerald-900/15 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
              </div>
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
