import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import MyRecipesTable from "../components/profile/MyRecipesTable";
import FavoritesGrid from "../components/profile/FavoritesGrid";
import AvatarEditor from "../components/profile/AvatarEditor";
import PasswordChanger from "../components/profile/PasswordChanger";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("recipes");
  const [loading, setLoading] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [showPasswordChanger, setShowPasswordChanger] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Vui lòng đăng nhập
          </h1>
          <p className="text-gray-600">
            Bạn cần đăng nhập để xem trang cá nhân
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-emerald-600">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">
                  Tham gia từ{" "}
                  {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAvatarEditor(true)}
                className="px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors"
              >
                Đổi Avatar
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("recipes")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "recipes"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Công thức của tôi
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "favorites"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Yêu thích
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Cài đặt
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "recipes" && (
              <MyRecipesTable userId={user.id || user._id} />
            )}
            {activeTab === "favorites" && (
              <FavoritesGrid userId={user.id || user._id} />
            )}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Cài đặt tài khoản
                  </h3>

                  {/* Avatar Settings */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Avatar
                        </h4>
                        <p className="text-sm text-gray-500">
                          Cập nhật ảnh đại diện của bạn
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAvatarEditor(true)}
                        className="px-4 py-2 text-sm font-medium text-emerald-600 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                      >
                        Thay đổi
                      </button>
                    </div>
                  </div>

                  {/* Password Settings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          Mật khẩu
                        </h4>
                        <p className="text-sm text-gray-500">
                          Thay đổi mật khẩu của bạn
                        </p>
                      </div>
                      <button
                        onClick={() => setShowPasswordChanger(true)}
                        className="px-4 py-2 text-sm font-medium text-emerald-600 bg-white border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showAvatarEditor && (
          <AvatarEditor
            onClose={() => setShowAvatarEditor(false)}
            onSuccess={(message) => showNotification(message, "success")}
          />
        )}

        {showPasswordChanger && (
          <PasswordChanger
            onClose={() => setShowPasswordChanger(false)}
            onSuccess={(message) => showNotification(message, "success")}
          />
        )}

        {/* Notification */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`px-6 py-3 rounded-md shadow-lg ${
                notification.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {notification.type === "success" ? (
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{notification.message}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
