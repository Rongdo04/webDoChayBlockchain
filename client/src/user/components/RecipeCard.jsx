import React from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaImage, FaStar } from "react-icons/fa";

export default function RecipeCard({
  recipe,
  onToggleFavorite,
  isFavorited = false,
}) {
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/recipes/${recipe.slug || recipe._id}`}>
        <div className="aspect-w-16 aspect-h-9">
          {recipe.images && recipe.images.length > 0 ? (
            <img
              className="w-full h-48 object-cover"
              src={recipe.images[0].url}
              alt={recipe.title}
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <FaImage className="text-gray-400 text-4xl" />
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <Link
              to={`/recipes/${recipe.slug || recipe._id}`}
              className="block"
            >
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-emerald-600">
                {recipe.title}
              </h3>
            </Link>
            <p className="mt-1 text-xs text-gray-500 line-clamp-2">
              {recipe.summary || recipe.description}
            </p>
          </div>
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleFavorite(recipe._id);
              }}
              className={`ml-2 ${
                isFavorited
                  ? "text-red-500"
                  : "text-gray-400 hover:text-red-500"
              }`}
              title={isFavorited ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              <FaHeart
                className={`h-5 w-5 ${isFavorited ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <FaStar className="text-yellow-400" />
            <span>
              {recipe.ratingAvg ? recipe.ratingAvg.toFixed(1) : "0.0"}
            </span>
            <span>({recipe.ratingCount || 0})</span>
          </div>
          <span>{recipe.prepTime + recipe.cookTime} phút</span>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          {formatDate(recipe.createdAt)}
        </div>
      </div>
    </div>
  );
}
