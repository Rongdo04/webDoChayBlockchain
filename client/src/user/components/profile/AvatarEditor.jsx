import React, { useState } from "react";
import authAPI from "../../../services/authAPI";
import { useAuth } from "../../../contexts/AuthContext";

export default function AvatarEditor({ onClose, onSuccess }) {
  const { user, updateUser } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate URL
      if (avatarUrl && !isValidUrl(avatarUrl)) {
        setError("URL không hợp lệ");
        setLoading(false);
        return;
      }

      const response = await authAPI.updateProfile({
        avatar: avatarUrl.trim() || "",
      });

      if (response.success) {
        // Update user context
        updateUser(response.data.user);
        onSuccess?.("Cập nhật avatar thành công!");
        onClose?.();
      }
    } catch (error) {
      console.error("Error updating avatar:", error);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật avatar"
      );
    } finally {
      setLoading(false);
    }
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleClearAvatar = () => {
    setAvatarUrl(
      "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Cập nhật Avatar
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Avatar preview"
                      className="h-24 w-24 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center ${
                      avatarUrl ? "hidden" : "flex"
                    }`}
                  >
                    <span className="text-2xl font-bold text-emerald-600">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                </div>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleClearAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">
                Nhập URL hình ảnh từ bên ngoài để cập nhật avatar
              </p>
            </div>

            {/* URL Input */}
            <div>
              <label
                htmlFor="avatarUrl"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                URL Avatar
              </label>
              <input
                type="url"
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Để trống để sử dụng avatar mặc định
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
