import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taxonomyAPI } from "../../../services/taxonomyAPI.js";

function ChipSkeleton() {
  return (
    <div className="animate-pulse px-4 py-2 rounded-full bg-emerald-900/10 h-9 w-24" />
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="text-center py-4">
      <div className="text-emerald-800/60 text-sm mb-2">
        Không thể tải danh mục
      </div>
      <button
        onClick={onRetry}
        className="px-3 py-1 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700 transition"
      >
        Thử lại
      </button>
    </div>
  );
}

export default function CategoryChips({ limit = 8 }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taxonomyAPI.getCategories();
      // Limit the number of categories displayed
      setCategories(data.slice(0, limit));
    } catch (err) {
      console.error("Error loading categories:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [limit]);

  const handleCategoryClick = (category) => {
    navigate(
      `/recipes?category=${encodeURIComponent(category.slug || category.name)}`
    );
  };

  if (error) {
    return <ErrorState onRetry={fetchCategories} />;
  }

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2" aria-label="Danh mục nhanh">
        {Array.from({ length: 6 }).map((_, i) => (
          <ChipSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-emerald-800/60 text-sm">Chưa có danh mục nào</div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Danh mục nhanh">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => handleCategoryClick(category)}
          className="px-4 py-2 rounded-full bg-white border border-emerald-900/10 text-emerald-900 text-sm font-medium hover:bg-emerald-900/5 focus:outline-none focus:ring-2 focus:ring-lime-400 inline-flex items-center gap-1 shadow-sm transition"
          aria-label={`Xem công thức ${category.name}`}
        >
          {category.icon && <span className="text-base">{category.icon}</span>}
          {category.name}
          {category.usageCount > 0 && (
            <span className="text-xs text-emerald-600/70 ml-1">
              ({category.usageCount})
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
