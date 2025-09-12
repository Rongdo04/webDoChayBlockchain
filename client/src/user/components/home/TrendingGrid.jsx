import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { recipesAPI } from "../../../services/recipesAPI.js";

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl overflow-hidden bg-white border border-emerald-900/10 p-4 space-y-3">
      <div className="h-36 rounded-xl bg-emerald-900/10" />
      <div className="h-4 w-3/4 rounded bg-emerald-900/10" />
      <div className="h-3 w-1/2 rounded bg-emerald-900/10" />
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-emerald-800/60 text-sm">
        Không thể tải công thức nổi bật
      </div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition"
      >
        Thử lại
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-emerald-800/60 text-sm">
        Chưa có công thức nổi bật nào
      </div>
    </div>
  );
}

export default function TrendingGrid({ limit = 8 }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrendingRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recipesAPI.getTrending({ limit, sort: "rating" });
      setRecipes(data);
    } catch (err) {
      console.error("Error loading trending recipes:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingRecipes();
  }, [limit]);

  if (error) {
    return (
      <section className="space-y-4" aria-labelledby="trending-title">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="trending-title"
            className="text-lg font-semibold tracking-tight text-emerald-950"
          >
            Đang thịnh hành
          </h2>
        </div>
        <ErrorState onRetry={fetchTrendingRecipes} />
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-labelledby="trending-title">
      <div className="flex items-center justify-between gap-4">
        <h2
          id="trending-title"
          className="text-lg font-semibold tracking-tight text-emerald-950"
        >
          Đang thịnh hành
        </h2>
        {!loading && recipes.length > 0 && (
          <span className="text-xs text-emerald-800/60">
            {recipes.length} món nổi bật
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: limit }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {recipes.map((recipe) => (
            <Link
              key={recipe._id}
              to={`/recipes/${recipe.slug}`}
              className="group rounded-2xl overflow-hidden bg-white border border-emerald-900/10 shadow-sm hover:shadow-brand focus:shadow-brand transition block"
            >
              <article>
                <div className="relative aspect-[4/3] bg-emerald-900/10 overflow-hidden">
                  {recipe.images?.[0] ? (
                    <img
                      src={
                        typeof recipe.images[0] === "string"
                          ? recipe.images[0]
                          : recipe.images[0]?.url ||
                            `/uploads/${
                              recipe.images[0]?.filename || recipe.images[0]
                            }`
                      }
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-emerald-700">
                      Không có ảnh
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-950/70 text-lime-200 backdrop-blur shadow">
                    {recipe.category || "Chưa phân loại"}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-emerald-950 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-emerald-800/70 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <span
                      className="px-2 py-1 rounded-md bg-emerald-900/5 text-[10px] font-medium text-emerald-900"
                      aria-label="Thời gian nấu"
                      title={`Chuẩn bị: ${recipe.prepTime || 0}′, Nấu: ${
                        recipe.cookTime || 0
                      }′`}
                    >
                      {(() => {
                        const totalTime =
                          (recipe.prepTime || 0) + (recipe.cookTime || 0);
                        return totalTime > 0 ? `${totalTime}′` : "Chưa có";
                      })()}
                    </span>
                    <span
                      className="px-2 py-1 rounded-md bg-emerald-900/5 text-[10px] font-medium text-emerald-900"
                      aria-label="Đánh giá trung bình"
                      title={`${recipe.ratingCount || 0} lượt đánh giá`}
                    >
                      ★{" "}
                      {(() => {
                        const rating = recipe.ratingAvg || 0;
                        return rating > 0 ? rating.toFixed(1) : "0.0";
                      })()}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
