import React, { useRef, useState } from "react";
import { mediaAPI } from "../../../services/mediaAPI.js";
import { config } from "../../../config/index.js";

export default function UploadDropzone({ images, onChange }) {
  const inputRef = useRef();
  const [drag, setDrag] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Get backend base URL for images
  const getBackendUrl = () => {
    return config.API.BASE_URL.replace("/api", ""); // Remove /api to get base backend URL
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    const list = Array.from(files).slice(0, 10 - images.length); // Respect total limit
    if (list.length === 0) return;

    setUploading(true);

    try {
      // Upload files to server immediately
      const uploadResults = await mediaAPI.uploadFiles(list);

      // Create image objects with uploaded media info
      const newImages = uploadResults.map((result, index) => {
        const imageObj = {
          id: result._id || result.id || result.data?._id || result.data?.id,
          url:
            result.url ||
            result.data?.url ||
            `${getBackendUrl()}/uploads/${
              result.filename || result.data?.filename || result.filename
            }`,
          filename:
            result.filename || result.data?.filename || list[index].name,
          originalName: list[index].name,
          type: "uploaded",
        };

        return imageObj;
      });

      // Add to existing images
      onChange([...images, ...newImages]);
    } catch (error) {
      console.error("Upload failed:", error);

      // Fallback to base64 if upload fails
      const readers = list.map(
        (file) =>
          new Promise((res) => {
            const reader = new FileReader();
            reader.onload = (e) =>
              res({
                url: e.target.result,
                filename: file.name,
                originalName: file.name,
                type: "base64",
              });
            reader.readAsDataURL(file);
          })
      );

      const items = await Promise.all(readers);
      onChange([...images, ...items]);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition ${
          drag
            ? "border-emerald-600 bg-emerald-50/60"
            : "border-emerald-900/20 bg-white"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <p className="text-sm font-medium text-emerald-900">
          Kéo & thả ảnh hoặc
        </p>
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={uploading || images.length >= 10}
          className="mt-3 btn-brand disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Đang tải lên..." : "Chọn ảnh"}
        </button>
        <p className="mt-2 text-xs text-emerald-700/70">
          Tối đa 10 ảnh. Ưu tiên JPG/PNG &lt; 1MB.
          {uploading && (
            <span className="text-emerald-600 font-medium">
              {" "}
              Đang upload...
            </span>
          )}
        </p>
      </div>
      {images.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((image, idx) => {
            // Handle both old string format and new object format
            const imageUrl = typeof image === "string" ? image : image.url;
            const imageType = typeof image === "object" ? image.type : "base64";

            return (
              <li key={idx} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Ảnh ${idx + 1}`}
                  className="w-full h-24 object-cover rounded-xl border border-emerald-900/10"
                />
                {imageType === "uploaded" && (
                  <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                    ✓
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => onChange(images.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition"
                  aria-label="Xoá"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
