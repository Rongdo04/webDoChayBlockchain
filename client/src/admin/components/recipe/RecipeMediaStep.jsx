/**
 * RecipeMediaStep
 * Props: { data, onChange, errors }
 * Structure: images array for recipe
 */
import React, { useState, useEffect } from "react";
import { useAdminApi } from "../../contexts/AdminApiContext.jsx";
import { Link } from "react-router-dom";
export default function RecipeMediaStep({ data, onChange, errors = {} }) {
  const adminApi = useAdminApi();
  const [open, setOpen] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("image");

  // Load media when modal opens
  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open]);

  // Debounce search
  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        loadMedia();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  // Reload when switching type (image/video)
  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [typeFilter, open]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (typeFilter === "image" || typeFilter === "video")
        params.type = typeFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const result = await adminApi.safeApiCall(
        () => adminApi.getMedia(params),
        { defaultErrorMessage: "Không thể tải thư viện media" }
      );

      if (result.success) {
        const responseData = result.data?.data || result.data || {};
        console.log("Media API response:", responseData); // Debug info

        // Handle different response structures
        let items = [];
        if (responseData.items) {
          items = responseData.items;
        } else if (Array.isArray(responseData)) {
          items = responseData;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          items = responseData.data;
        }

        items = items
          .filter((item) => item && (item.id || item._id))
          .map((item) => ({ ...item, id: item.id || item._id }));

        console.log("Processed media items:", items); // Debug info
        setMediaList(items);
      }
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setLoading(false);
    }
  };

  const addImage = (m) => {
    console.log("Adding media item:", m); // Debug info
    const newImage = {
      _id: m._id || m.id, // Use real media ID
      url: m.url,
      thumbnailUrl: m.thumbnailUrl || null,
      type: m.type,
      alt: m.alt || "",
      caption: "",
    };
    console.log("Created image object:", newImage); // Debug info
    onChange({
      ...data,
      images: [...(data.images || []), newImage],
    });
    setOpen(false);
  };

  const removeImage = (imageId) => {
    onChange({
      ...data,
      images: data.images.filter((img) => img._id !== imageId),
    });
  };

  const updateImage = (imageId, field, value) => {
    onChange({
      ...data,
      images: data.images.map((img) =>
        img._id === imageId ? { ...img, [field]: value } : img
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Media công thức</h3>
          <p className="text-xs text-gray-600 mt-1">
            Thêm hình ảnh hoặc video để minh họa cho công thức
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="btn-brand"
          >
            Thêm media
          </button>

          {/* Nút yêu cầu */}
          <Link
            to="http://localhost:5173/admin/media"
            className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50"
          >
            Thêm ảnh
          </Link>
        </div>
      </div>

      {errors.images && <p className="text-xs text-red-600">{errors.images}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {(data.images || []).map((image, idx) => (
          <div
            key={image._id || idx}
            className="bg-white border rounded-lg p-4"
          >
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3 flex items-center justify-center text-[10px] font-medium text-emerald-700">
              <img
                src={image.thumbnailUrl || image.url}
                alt={image.alt || `Media ${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement.textContent =
                    image.type === "video" ? "VIDEO" : "IMG";
                }}
              />
            </div>
            <div className="space-y-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">
                  Văn bản thay thế (Alt)
                </label>
                <input
                  value={image.alt || ""}
                  onChange={(e) =>
                    updateImage(image._id, "alt", e.target.value)
                  }
                  className="input text-sm"
                  placeholder="Mô tả media cho SEO"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">
                  Chú thích (tùy chọn)
                </label>
                <input
                  value={image.caption || ""}
                  onChange={(e) =>
                    updateImage(image._id, "caption", e.target.value)
                  }
                  className="input text-sm"
                  placeholder="Chú thích hiển thị dưới media"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(image._id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Xóa media
              </button>
            </div>
          </div>
        ))}
      </div>

      {(!data.images || data.images.length === 0) && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p>Chưa có media nào được thêm</p>
          <p className="text-sm">
            Hãy thêm media để làm cho công thức hấp dẫn hơn
          </p>
        </div>
      )}

      {/* Media Selection Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden m-4">
            <div className="p-4 border-b flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-medium">Chọn media</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {["image", "video"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setTypeFilter(v)}
                      className={[
                        "relative shrink-0 px-4 py-1.5 text-xs font-medium rounded-md transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                        typeFilter === v
                          ? "bg-emerald-900 text-white z-10"
                          : "text-emerald-800 hover:bg-emerald-900/10 z-0",
                      ].join(" ")}
                    >
                      {v === "image" ? "Hình ảnh" : "Video"}
                    </button>
                  ))}
                </div>

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm media..."
                  className="input"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-xl text-sm font-medium bg-white border border-emerald-900/15 hover:bg-emerald-50"
                >
                  Đóng
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {mediaList.map((m) => (
                  <div
                    key={m.id}
                    className="cursor-pointer group"
                    onClick={() => addImage(m)}
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 group-hover:ring-2 group-hover:ring-emerald-500 transition-all flex items-center justify-center text-[10px] font-medium text-emerald-700">
                      <img
                        src={m.thumbnailUrl || m.url}
                        alt={m.alt || "media"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.textContent =
                            m.type === "video" ? "VIDEO" : "IMG";
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {m.originalName || "Untitled"}
                    </p>
                  </div>
                ))}
              </div>
              {loading && <p className="text-center py-4">Đang tải...</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
