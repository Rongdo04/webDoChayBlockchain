import React, { useState, useEffect } from "react";
import { recipesAPI } from "../../../services/recipesAPI.js";
import { FaStar } from "react-icons/fa";
// Real search with API
export default function GroupedResults({ query }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const q = query.trim().toLowerCase();

  useEffect(() => {
    if (!q) {
      setRecipes([]);
      return;
    }

    const searchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await recipesAPI.getRecipes({
          search: q,
          limit: 20,
          page: 1,
        });
        setRecipes(result.data || []);
      } catch (err) {
        console.error("Search error:", err);
        setError(err);
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    searchRecipes();
  }, [q]);

  if (!q) return null;

  if (loading) {
    return (
      <div className="p-8 rounded-2xl border border-emerald-900/10 bg-white shadow-sm text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-emerald-800/70">Đang tìm kiếm...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-emerald-900/10 bg-white shadow-sm text-center space-y-4">
        <p className="text-sm text-emerald-800/70">
          Có lỗi xảy ra khi tìm kiếm.
        </p>
        <p className="text-xs text-emerald-800/50">Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // Extract ingredients from search results
  const ingredientSet = new Set();
  recipes.forEach((r) =>
    r.ingredients?.forEach((ingredient) => {
      const name =
        typeof ingredient === "string" ? ingredient : ingredient.name;
      if (name && name.toLowerCase().includes(q)) {
        ingredientSet.add(name);
      }
    })
  );
  const ingredients = Array.from(ingredientSet).slice(0, 15);

  // Extract tags and categories
  const tagSet = new Set();
  recipes.forEach((r) => {
    r.tags?.forEach((t) => t.toLowerCase().includes(q) && tagSet.add(t));
    if (r.category && r.category.toLowerCase().includes(q))
      tagSet.add(r.category);
  });
  const tags = Array.from(tagSet).slice(0, 15);

  const empty =
    recipes.length === 0 && ingredients.length === 0 && tags.length === 0;

  if (empty) {
    const tryKeywords = ["đậu hũ", "nấm", "salad", "bí đỏ", "bún", "gỏi"]; // suggestion chips
    return (
      <div className="p-8 rounded-2xl border border-emerald-900/10 bg-white shadow-sm text-center space-y-4">
        <p className="text-sm text-emerald-800/70">Không tìm thấy kết quả.</p>
        <p className="text-xs text-emerald-800/50">Gợi ý thử:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {tryKeywords.map((k) => (
            <span
              key={k}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-900/5 text-emerald-900/70 border border-emerald-900/10"
            >
              {k}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10" aria-label="Kết quả tìm kiếm">
      {/* Recipes */}
      {recipes.length > 0 && (
        <section aria-labelledby="result-recipes-title" className="space-y-4">
          <h2
            id="result-recipes-title"
            className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70"
          >
            Món ({recipes.length})
          </h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recipes.map((r) => {
              // Handle image URL similar to TrendingGrid
              let imageUrl = null;
              if (r?.images?.[0]) {
                if (typeof r.images[0] === "string") {
                  imageUrl = r.images[0];
                } else if (r.images[0]?.url) {
                  imageUrl = r.images[0].url;
                } else if (r.images[0]?.filename) {
                  imageUrl = `/uploads/${r.images[0].filename}`;
                }
              }

              const totalTime = (r.prepTime || 0) + (r.cookTime || 0);
              const rating = r.ratingAvg || 0;

              return (
                <li key={r._id || r.id} className="group">
                  <a
                    href={`/recipes/${r.slug}`}
                    className="block rounded-xl overflow-hidden ring-1 ring-emerald-900/15 bg-white shadow-sm hover:shadow-md transition"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-emerald-900/5">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={r.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-medium text-emerald-700">
                          IMG
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-emerald-900/90 leading-snug line-clamp-2">
                        {r.title}
                      </h3>
                      <p className="text-[11px] text-emerald-800/60 line-clamp-2">
                        {r.summary || r.description || ""}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-1 rounded-md bg-emerald-900/5 text-[10px] font-medium text-emerald-900">
                          {totalTime > 0 ? `${totalTime}′` : "Chưa có"}
                        </span>
                        <span className="px-2 py-1 rounded-md bg-emerald-900/5 text-[10px] font-medium text-emerald-900">
                          <FaStar className="inline mr-1" />{" "}
                          {rating > 0 ? rating.toFixed(1) : "0.0"}
                        </span>
                      </div>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <section
          aria-labelledby="result-ingredients-title"
          className="space-y-4"
        >
          <h2
            id="result-ingredients-title"
            className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70"
          >
            Nguyên liệu ({ingredients.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-900/5 text-emerald-900/70 border border-emerald-900/10"
              >
                {ing}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <section aria-labelledby="result-tags-title" className="space-y-4">
          <h2
            id="result-tags-title"
            className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70"
          >
            Thẻ ({tags.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-900/5 text-emerald-900/70 border border-emerald-900/10"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
