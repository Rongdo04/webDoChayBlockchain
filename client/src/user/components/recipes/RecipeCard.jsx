import React from "react";
import { FaImage, FaClock, FaStar, FaUsers } from "react-icons/fa";

export default function RecipeCard({ recipe }) {
  // Chọn thumbnail ưu tiên cho video; fallback ảnh thường (ưu tiên thumbnailUrl)
  const images = Array.isArray(recipe?.images) ? recipe.images : [];
  const isVideoItem = (item) => {
    if (!item || typeof item === "string") return false;
    if (item.type === "video") return true;
    if (item.mimeType && String(item.mimeType).startsWith("video")) return true;
    const src = item.url || item.src || item.filename || "";
    return /(\.mp4|\.webm|\.mov|\.avi)$/i.test(String(src));
  };

  const firstVideo = images.find((m) => isVideoItem(m));
  const firstImage = images.find((m) => !isVideoItem(m)) || images[0];

  const videoThumb = firstVideo?.thumbnailUrl || null;
  const videoSrc =
    (typeof firstVideo === "string" ? firstVideo : firstVideo?.url) || null;

  const imageThumb = firstImage?.thumbnailUrl || null;
  const imageSrc =
    (typeof firstImage === "string"
      ? firstImage
      : firstImage?.url ||
        (firstImage?.filename ? `/uploads/${firstImage.filename}` : null)) ||
    null;

  const hasVideo = Boolean(firstVideo);
  const imageUrl =
    (hasVideo ? videoThumb || videoSrc : imageThumb || imageSrc) ||
    recipe?.image ||
    null;

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
              e.currentTarget.style.display = "none";
              const iconDiv = document.createElement("div");
              iconDiv.className = "flex items-center justify-center";
              iconDiv.innerHTML = '<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg>';
              e.currentTarget.parentElement.appendChild(iconDiv);
            }}
          />
        ) : (
          <FaImage className="text-2xl text-gray-400" />
        )}

        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {hasVideo && (
            <span className="px-2 py-1 bg-emerald-950/80 text-lime-200 text-[10px] font-semibold rounded-full">
              VIDEO
            </span>
          )}
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
              <FaClock className="inline mr-1" /> {totalMins > 0 ? `${totalMins}′` : "N/A"}
            </span>

            {/* Rating */}
            <span
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-900/5 text-[10px] font-medium text-emerald-900"
              title={`${recipe.ratingCount || 0} lượt đánh giá`}
            >
              <FaStar className="inline mr-1" /> {rating}
            </span>
          </div>

          {/* Servings */}
          {recipe.servings && (
            <span className="text-[10px] text-emerald-800/50">
              <FaUsers className="inline mr-1" /> {recipe.servings}
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
