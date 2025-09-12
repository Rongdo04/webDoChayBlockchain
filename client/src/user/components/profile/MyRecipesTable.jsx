import React, { useEffect, useState } from "react";
import { recipesAPI } from "../../../services/recipesAPI.js";
import { useAuthAdapter } from "../../../auth/useAuthAdapter.js";

export default function MyRecipesTable({ onUpdate }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthAdapter();

  useEffect(() => {
    const fetchMyRecipes = async () => {
      if (!user) {
        setList([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // For now, get all recipes and filter by author on client side
        // In real app, you would have a specific API endpoint for user's recipes
        const response = await recipesAPI.getRecipes({
          limit: 100,
          sort: "newest",
        });

        // Filter by current user (if user ID is available)
        const userRecipes =
          response.data?.filter(
            (recipe) =>
              recipe.authorId?._id === user.id || recipe.authorId === user.id
          ) || [];

        setList(userRecipes);
      } catch (err) {
        console.error("Error fetching my recipes:", err);
        setError(err);
        setList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRecipes();
  }, [user]);

  const updateTitle = (id, title) => {
    setList((prev) => prev.map((r) => (r._id === id ? { ...r, title } : r)));
    onUpdate?.(id, { title });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse h-16 bg-emerald-900/5 rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        Có lỗi khi tải danh sách công thức. Vui lòng thử lại.
      </p>
    );
  }

  if (!list.length) {
    return (
      <p className="text-sm text-emerald-800/60" role="status">
        Bạn chưa đăng công thức nào.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl ring-1 ring-emerald-900/15 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-emerald-900/5 text-emerald-900/70 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-4 py-3 font-semibold">Tiêu đề</th>
            <th className="text-left px-4 py-3 font-semibold">Danh mục</th>
            <th className="text-left px-4 py-3 font-semibold">Ngày</th>
            <th className="text-right px-4 py-3 font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r._id} className="border-t border-emerald-900/10">
              <td className="px-4 py-2 align-top w-[40%]">
                <input
                  defaultValue={r.title}
                  onBlur={(e) =>
                    updateTitle(r._id, e.target.value.trim() || r.title)
                  }
                  className="w-full rounded-lg border border-emerald-900/20 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
                  aria-label={`Sửa tiêu đề cho ${r.title}`}
                />
              </td>
              <td className="px-4 py-2 align-top text-emerald-800/70 text-xs">
                {r.category || "Chưa phân loại"}
              </td>
              <td className="px-4 py-2 align-top text-emerald-800/60 text-xs">
                {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })}
              </td>
              <td className="px-4 py-2 align-top text-right">
                <a
                  href={`/recipes/${r.slug}`}
                  className="text-[11px] font-medium text-emerald-700 hover:underline focus:outline-none"
                >
                  Xem
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
