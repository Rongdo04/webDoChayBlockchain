// components/ui/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ message = "Đang tải...", size = "large" }) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center ${sizeClasses[size]} bg-[#66c2ff] rounded-full shadow-lg mb-4`}
        >
          <div
            className={`animate-spin rounded-full ${
              size === "small"
                ? "h-3 w-3"
                : size === "medium"
                ? "h-6 w-6"
                : "h-8 w-8"
            } border-b-2 border-white`}
          ></div>
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
