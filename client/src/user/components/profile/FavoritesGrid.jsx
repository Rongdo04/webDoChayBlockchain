import React, { useEffect, useState } from "react";
import { recipesAPI } from "../../../services/recipesAPI.js";

export default function FavoritesGrid({ onRemove }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const favIds = JSON.parse(localStorage.getItem("favorites") || "[]");

        if (favIds.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }

        // Get all recipes and filter by favorite IDs
        const response = await recipesAPI.getRecipes({
          limit: 100,
          sort: "newest",
        });

        const favoriteRecipes =
          response.data?.filter((recipe) => favIds.includes(recipe._id)) || [];

        setFavorites(favoriteRecipes);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setError(err);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRemove = (id) => {
    const favIds = JSON.parse(localStorage.getItem("favorites") || "[]");
    const updated = favIds.filter((f) => f !== id);
    localStorage.setItem("favorites", JSON.stringify(updated));
    setFavorites((prev) => prev.filter((r) => r._id !== id));
    onRemove?.(id);
  };

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-40 bg-emerald-900/10 rounded-t-2xl" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-emerald-900/10 rounded w-3/4" />
              <div className="h-3 bg-emerald-900/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Có lỗi khi tải danh sách yêu thích. Vui lòng thử lại.
      </p>
    );
  }

  if (!favorites.length) {
    return (
      <p className="text-sm text-emerald-800/60" role="status">
        Chưa có công thức yêu thích.
      </p>
    );
  }

  return (
    <ul
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      aria-label="Danh sách yêu thích"
    >
      {favorites.map((r) => {
        // Handle image URL
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

        return (
          <li
            key={r._id}
            className="group rounded-2xl overflow-hidden ring-1 ring-emerald-900/15 bg-white shadow-sm flex flex-col"
          >
            <a href={`/recipes/${r.slug}`} className="block relative">
              <div className="aspect-[4/3] overflow-hidden bg-emerald-900/5">
                <img
                  src={imageUrl || "/api/placeholder/400/300"}
                  alt={r.title}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition"
                  loading="lazy"
                />
              </div>
            </a>
            <div className="p-4 flex-1 flex flex-col space-y-3">
              <h3 className="text-sm font-semibold text-emerald-900/90 leading-snug line-clamp-2">
                {r.title}
              </h3>
              <p className="text-[11px] text-emerald-800/60 line-clamp-2">
                {r.summary || r.description}
              </p>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleRemove(r._id)}
                  className="text-[11px] font-medium text-rose-600 hover:text-rose-700 focus:outline-none focus:underline"
                  aria-label={`Gỡ khỏi yêu thích ${r.title}`}
                >
                  Gỡ
                </button>
                <a
                  href={`/recipes/${r.slug}`}
                  className="text-[11px] font-medium text-emerald-700 hover:underline ml-auto"
                  aria-label={`Mở công thức ${r.title}`}
                >
                  Xem
                </a>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
