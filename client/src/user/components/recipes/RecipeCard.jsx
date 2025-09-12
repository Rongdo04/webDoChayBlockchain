import React from "react";

export default function RecipeCard({ recipe }) {
  // Xử lý URL ảnh từ populate object hoặc string
  let imageUrl = null;
  if (recipe?.images?.[0]) {
    if (typeof recipe.images[0] === "string") {
      imageUrl = recipe.images[0];
    } else if (recipe.images[0]?.url) {
      imageUrl = recipe.images[0].url;
    } else if (recipe.images[0]?.filename) {
      imageUrl = `/uploads/${recipe.images[0].filename}`;
    }
  } else if (recipe?.image) {
    imageUrl = recipe.image;
  }

  // Tính tổng thời gian (phút)
  const totalMins = (() => {
    const prepTime = recipe.prepTime || 0;
    const cookTime = recipe.cookTime || 0;
    const total = prepTime + cookTime;
    return total > 0 ? total : 0;
  })();

  const rating = (() => {
    const ratingAvg = recipe.ratingAvg || 0;
    return ratingAvg > 0 ? ratingAvg.toFixed(1) : "0.0";
  })();

  return (
    <a
      href={`/recipes/${recipe.slug}`}
      className="group rounded-xl border border-emerald-900/10 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-lime-400"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-emerald-900/10 overflow-hidden flex items-center justify-center text-xs font-medium text-emerald-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={recipe.title || "Recipe thumbnail"}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.textContent = "📷";
            }}
          />
        ) : (
          <div className="text-2xl">📷</div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {recipe.difficulty && (
            <span className="px-2 py-1 bg-white/90 text-emerald-700 text-xs font-medium rounded-full">
              {recipe.difficulty}
            </span>
          )}
          {recipe.dietType && (
            <span className="px-2 py-1 bg-emerald-600/90 text-white text-xs font-medium rounded-full">
              {recipe.dietType}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-semibold text-emerald-900 line-clamp-2 group-hover:text-emerald-700 transition">
          {recipe.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-emerald-800/70 line-clamp-2">
          {recipe.description || recipe.summary || "Chưa có mô tả"}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {/* Time */}
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-900/5 text-[10px] font-medium text-emerald-900"
              title={`Chuẩn bị: ${recipe.prepTime || 0}′, Nấu: ${
                recipe.cookTime || 0
              }′`}
            >
              ⏱️ {totalMins > 0 ? `${totalMins}′` : "N/A"}
            </span>

            {/* Rating */}
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-900/5 text-[10px] font-medium text-emerald-900"
              title={`${recipe.ratingCount || 0} lượt đánh giá`}
            >
              ⭐ {rating}
            </span>
          </div>

          {/* Servings */}
          {recipe.servings && (
            <span className="text-[10px] text-emerald-800/50">
              👥 {recipe.servings}
            </span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-lime-100 text-emerald-700 text-[9px] font-medium rounded"
              >
                {tag}
              </span>
            ))}
            {recipe.tags.length > 3 && (
              <span className="text-[9px] text-emerald-600">
                +{recipe.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
