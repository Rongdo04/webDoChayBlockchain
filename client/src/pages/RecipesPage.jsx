import React, { useState } from "react";
import AllRecipes from "../components/recipes/AllRecipes";

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "popular", label: "Phổ biến" },
  { value: "time", label: "Thời gian nấu" },
];

export default function RecipesPage() {
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-emerald-50">
      {/* Header với filters */}
      <div className="bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-emerald-950">
                Khám phá công thức
              </h1>
              <p className="text-emerald-700 mt-1">
                Tìm kiếm và khám phá hàng trăm công thức món chay ngon miệng
              </p>
            </div>

            {/* Sort dropdown */}
            <div className="flex items-center gap-3">
              <label
                htmlFor="sort"
                className="text-sm font-medium text-emerald-700"
              >
                Sắp xếp:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-emerald-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCategory === null
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              }`}
            >
              Tất cả
            </button>
            {["main-dish", "appetizer", "soup", "salad", "dessert"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    selectedCategory === category
                      ? "bg-emerald-600 text-white"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  {getCategoryLabel(category)}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <AllRecipes
        title=""
        sortBy={sortBy}
        category={selectedCategory}
        initialLimit={16}
        showLoadMore={true}
      />
    </div>
  );
}

function getCategoryLabel(category) {
  const labels = {
    "main-dish": "Món chính",
    appetizer: "Khai vị",
    soup: "Canh",
    salad: "Salad",
    dessert: "Tráng miệng",
  };
  return labels[category] || category;
}
