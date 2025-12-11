import React from "react";
import { FaTimes, FaClock, FaUsers, FaStar, FaImage } from "react-icons/fa";

export default function RecipeViewModal({ recipe, isOpen, onClose }) {
  if (!isOpen || !recipe) return null;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const rating = recipe.ratingAvg || 0;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{recipe.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-6 w-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-4">
            {recipe.images && recipe.images.length > 0 ? (
              <img
                src={recipe.images[0].thumbnailUrl || recipe.images[0].url}
                alt={recipe.title}
                className="w-full h-64 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.innerHTML =
                    '<div class="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center"><svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/></svg></div>';
                }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <FaImage className="w-12 h-12 text-gray-400" />
              </div>
            )}

            {/* Recipe Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <FaClock className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">{totalTime} phút</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaUsers className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {recipe.servings} khẩu phần
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FaStar className="h-5 w-5 text-yellow-400" />
                <span className="text-sm text-gray-600">
                  {rating.toFixed(1)}/5
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {recipe.status === "published"
                    ? "Đã xuất bản"
                    : recipe.status === "draft"
                    ? "Bản nháp"
                    : recipe.status === "pending"
                    ? "Chờ duyệt"
                    : recipe.status === "review"
                    ? "Chờ duyệt"
                    : recipe.status === "rejected"
                    ? "Bị từ chối"
                    : recipe.status}
                </span>
              </div>
            </div>
            
            {/* Rejection Reason */}
            {recipe.status === "rejected" && recipe.rejection?.reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-1">
                      Lý do từ chối
                    </h4>
                    <p className="text-sm text-red-700">
                      {recipe.rejection.reason}
                    </p>
                    {recipe.rejection.at && (
                      <p className="text-xs text-red-600 mt-1">
                        Ngày từ chối: {new Date(recipe.rejection.at).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Mô tả
              </h3>
              <p className="text-gray-600">
                {recipe.summary || recipe.description || "Chưa có mô tả"}
              </p>
            </div>

            {/* Ingredients */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nguyên liệu
                </h3>
                <ul className="space-y-1">
                  {recipe.ingredients.map((ingredient, index) => {
                    const name =
                      typeof ingredient === "string"
                        ? ingredient
                        : ingredient.name;
                    return (
                      <li
                        key={index}
                        className="text-gray-600 flex items-center"
                      >
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                        {name}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Steps */}
            {recipe.steps && recipe.steps.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Các bước thực hiện
                </h3>
                <ol className="space-y-2">
                  {recipe.steps.map((step, index) => {
                    const description =
                      typeof step === "string" ? step : step.description;
                    return (
                      <li key={index} className="text-gray-600 flex">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span>{description}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
