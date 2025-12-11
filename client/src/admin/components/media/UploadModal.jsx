/** UploadModal - API Integration
 * Props: { open, onClose, onSuccess, uploadMode, adminApi, showToast }
 * Supports both local and S3 upload modes
 */
import React, { useState, useRef, useCallback } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const ALLOWED_TYPES = {
  image: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  // Sync with backend allowed mimes (plus common equivalents)
  video: [
    "video/mp4",
    "video/webm",
    "video/mov",
    "video/avi",
    "video/quicktime", // common for .mov
    "video/x-msvideo", // common for .avi
  ],
};

// Sync with backend limit (100MB)
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function UploadModal({
  open,
  onClose,
  onSuccess,
  uploadMode = "local",
  adminApi,
  showToast,
}) {
  const [files, setFiles] = useState([]); // { id, file, name, type, preview, alt, tags, progress, error, uploaded }
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  // Generate a client-side thumbnail for a video file (first/1s frame)
  const getVideoThumbnail = useCallback(async (file) => {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = url;
        video.muted = true;

        const cleanup = () => {
          try {
            URL.revokeObjectURL(url);
          } catch {}
        };

        const capture = () => {
          try {
            const canvas = document.createElement("canvas");
            const width = video.videoWidth || 480;
            const height = video.videoHeight || 270;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(video, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            cleanup();
            resolve(dataUrl);
          } catch (e) {
            cleanup();
            resolve("");
          }
        };

        video.addEventListener("loadedmetadata", () => {
          try {
            const targetTime = Math.min(
              1,
              Math.max(0, (video.duration || 0) / 2)
            );
            const onSeeked = () => {
              video.removeEventListener("seeked", onSeeked);
              capture();
            };
            video.addEventListener("seeked", onSeeked);
            video.currentTime = targetTime;
          } catch {
            capture();
          }
        });

        video.addEventListener("error", () => {
          cleanup();
          resolve("");
        });
      } catch {
        resolve("");
      }
    });
  }, []);

  const validateFile = (file) => {
    const errors = [];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File "${file.name}" quá lớn (tối đa 100MB)`);
    }

    // Check file type
    const allAllowedTypes = [...ALLOWED_TYPES.image, ...ALLOWED_TYPES.video];
    if (!allAllowedTypes.includes(file.type)) {
      errors.push(`File "${file.name}" không được hỗ trợ`);
    }

    return errors;
  };

  const handleFiles = useCallback(
    async (fileList) => {
      const validationErrors = [];
      const validFiles = [];

      const tasks = Array.from(fileList).map(async (file) => {
        const errors = validateFile(file);
        if (errors.length > 0) {
          validationErrors.push(...errors);
          return null;
        }
        const fileType = ALLOWED_TYPES.image.includes(file.type)
          ? "image"
          : "video";
        let preview = "";
        if (fileType === "image") {
          preview = URL.createObjectURL(file);
        } else {
          preview = await getVideoThumbnail(file);
        }
        return {
          id: "temp-" + Math.random().toString(36).slice(2),
          file,
          name: file.name,
          type: fileType,
          preview,
          alt: "",
          tags: "",
          progress: 0,
          error: null,
          uploaded: false,
          imgError: false,
        };
      });

      const processed = (await Promise.all(tasks)).filter(Boolean);
      validFiles.push(...processed);

      if (validationErrors.length > 0) {
        showToast(validationErrors.join("; "), "error");
      }

      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [showToast, getVideoThumbnail]
  );

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFile = (id, updates) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const uploadLocalFile = async (fileData) => {
    const formData = new FormData();
    formData.append("file", fileData.file);
    formData.append("alt", fileData.alt || "");
    formData.append("tags", fileData.tags || "");

    // Use low-level http client to get upload progress
    return await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
      }/api/admin/media`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      }
    ).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Upload failed");
      }
      return res.json();
    });
  };

  const uploadS3File = async (fileData) => {
    // Step 1: Get presigned URL
    const presignResult = await adminApi.presignMedia({
      filename: fileData.file.name,
      contentType: fileData.file.type,
      alt: fileData.alt || "",
      tags: fileData.tags || "",
    });

    if (!presignResult.success) {
      throw new Error(
        presignResult.error?.message || "Failed to get presigned URL"
      );
    }

    const { url, fields, key } = presignResult.data;

    // Step 2: Upload to S3
    const s3FormData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      s3FormData.append(key, value);
    });
    s3FormData.append("file", fileData.file);

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: s3FormData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload to S3");
    }

    // Step 3: Confirm upload
    const confirmResult = await adminApi.confirmMediaUpload({
      key,
      filename: fileData.file.name,
      contentType: fileData.file.type,
      alt: fileData.alt || "",
      tags: fileData.tags || "",
    });

    if (!confirmResult.success) {
      throw new Error(
        confirmResult.error?.message || "Failed to confirm upload"
      );
    }

    return confirmResult;
  };

  const uploadFile = async (fileData) => {
    try {
      updateFile(fileData.id, { progress: 10, error: null });

      let result;
      if (uploadMode === "s3") {
        result = await uploadS3File(fileData);
      } else {
        result = await uploadLocalFile(fileData);
      }

      updateFile(fileData.id, {
        progress: 100,
        uploaded: true,
        uploadedData: result.data?.data || result.data,
      });

      // Normalize response - ensure we get the media object
      const mediaItem = result.data?.data || result.data || result;

      // Add id field if only _id exists
      if (mediaItem._id && !mediaItem.id) {
        mediaItem.id = mediaItem._id;
      }

      // If this is a video and backend generated a thumbnail, update preview to thumbnail
      if (mediaItem && mediaItem.type === "video" && mediaItem.thumbnailUrl) {
        updateFile(fileData.id, {
          preview: mediaItem.thumbnailUrl,
          thumbnailUrl: mediaItem.thumbnailUrl,
          type: mediaItem.type,
          uploadedData: mediaItem,
          imgError: false,
        });
      }

      return mediaItem;
    } catch (error) {
      updateFile(fileData.id, {
        error: error.message || "Upload failed",
        progress: 0,
      });
      throw error;
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter((f) => !f.uploaded && !f.error);
    if (pendingFiles.length === 0) return;

    setUploading(true);
    const uploadedItems = [];

    try {
      for (const file of pendingFiles) {
        try {
          const uploadedItem = await uploadFile(file);
          uploadedItems.push(uploadedItem);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
        }
      }

      if (uploadedItems.length > 0) {
        onSuccess(uploadedItems);
        setFiles([]);
      } else {
        showToast("Không có file nào được tải lên thành công", "error");
      }
    } catch (error) {
      showToast("Lỗi khi tải lên files", "error");
    } finally {
      setUploading(false);
    }
  };

  // Cleanup on remove for already-uploaded files
  const handleRemove = async (file) => {
    // If this file has been uploaded and we have media id, request deletion
    const mediaId = file.uploadedData?._id || file.uploadedData?.id || file.id;
    if (file.uploaded && mediaId) {
      try {
        // Prefer admin delete if available, otherwise user route
        if (adminApi?.deleteMedia) {
          await adminApi.deleteMedia(mediaId);
        } else {
          await fetch(
            `${
              import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
            }/api/upload/${mediaId}`,
            { method: "DELETE", credentials: "include" }
          );
        }
      } catch (e) {
        console.warn("Failed to delete uploaded media:", e?.message || e);
      }
    }
    removeFile(file.id);
  };

  // Cleanup on modal close: delete any uploaded-but-not-submitted files
  const closeWithCleanup = async () => {
    try {
      const uploadedButNotSubmitted = files.filter(
        (f) => f.uploaded && f.uploadedData
      );
      for (const f of uploadedButNotSubmitted) {
        const mediaId = f.uploadedData?._id || f.uploadedData?.id || f.id;
        if (!mediaId) continue;
        try {
          if (adminApi?.deleteMedia) {
            await adminApi.deleteMedia(mediaId);
          } else {
            await fetch(
              `${
                import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
              }/api/upload/${mediaId}`,
              { method: "DELETE", credentials: "include" }
            );
          }
        } catch (e) {
          console.warn("Failed to cleanup media on close:", e?.message || e);
        }
      }
    } finally {
      setFiles([]);
      onClose?.();
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer?.files?.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Upload media"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 flex flex-col gap-6 max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-emerald-900">
            Tải lên Media ({uploadMode === "s3" ? "S3" : "Local"})
          </h3>
          <button
            onClick={closeWithCleanup}
            disabled={uploading}
            className="text-sm text-emerald-700 hover:underline disabled:opacity-50"
          >
            Đóng
          </button>
        </div>

        {/* Upload area */}
        <div
          className="border-2 border-dashed border-emerald-900/25 rounded-2xl p-10 flex flex-col items-center justify-center text-sm text-emerald-800/70 gap-3 bg-emerald-50/40 cursor-pointer hover:bg-emerald-50/60 transition"
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            type="file"
            multiple
            ref={inputRef}
            accept={[...ALLOWED_TYPES.image, ...ALLOWED_TYPES.video].join(",")}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-10 h-10 text-emerald-900/60"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-16.5 0L5.25 6a2.25 2.25 0 012.175-1.65h8.85A2.25 2.25 0 0118.75 6L21 16.5m-16.5 0h18m-13.5-3.75h.008v.008H7.5v-.008zm6.75 0h.008v.008h-.008v-.008z"
            />
          </svg>
          <p>
            <span className="font-medium text-emerald-900">
              Nhấp để chọn file
            </span>{" "}
            hoặc kéo thả file vào đây
          </p>
          <p className="text-xs text-emerald-800/50">
            Hình ảnh & Video (tối đa 100MB) - JPEG, PNG, GIF, WebP, MP4, WebM,
            MOV, AVI
          </p>
        </div>

        {/* File list */}
        {!!files.length && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-emerald-900">
                Files ({files.length})
              </h4>
              <button
                onClick={() => setFiles([])}
                disabled={uploading}
                className="text-xs text-emerald-700 hover:underline disabled:opacity-50"
              >
                Xóa tất cả
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-emerald-900/15 bg-white"
                >
                  {/* Preview */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-emerald-900/5 flex items-center justify-center flex-shrink-0">
                    {(f.thumbnailUrl || f.preview) && !f.imgError ? (
                      <img
                        src={f.thumbnailUrl || f.preview}
                        alt={f.name}
                        className="w-full h-full object-cover"
                        onError={() => updateFile(f.id, { imgError: true })}
                      />
                    ) : (
                      <span className="text-xs font-medium text-emerald-700">
                        {f.type === "video" ? "VIDEO" : "IMG"}
                      </span>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div
                      className="text-sm font-medium text-emerald-900 truncate"
                      title={f.name}
                    >
                      {f.name}
                    </div>

                    {/* Alt text input */}
                    <input
                      type="text"
                      value={f.alt}
                      onChange={(e) =>
                        updateFile(f.id, { alt: e.target.value })
                      }
                      disabled={uploading || f.uploaded}
                      className="w-full px-2 py-1 text-xs border border-emerald-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
                      placeholder="Mô tả ảnh..."
                    />

                    {/* Tags input */}
                    <input
                      type="text"
                      value={f.tags}
                      onChange={(e) =>
                        updateFile(f.id, { tags: e.target.value })
                      }
                      disabled={uploading || f.uploaded}
                      className="w-full px-2 py-1 text-xs border border-emerald-200 rounded focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50"
                      placeholder="Tags (ngăn cách bằng dấu phẩy)..."
                    />

                    {/* Progress bar */}
                    {f.progress > 0 && f.progress < 100 && (
                      <div className="w-full bg-emerald-100 rounded-full h-1.5">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${f.progress}%` }}
                        ></div>
                      </div>
                    )}

                    {/* Status */}
                    {f.uploaded && (
                      <div className="text-xs text-green-600 font-medium">
                        <FaCheck className="inline mr-1" /> Đã tải lên thành công
                      </div>
                    )}
                    {f.error && (
                      <div className="text-xs text-red-600">{f.error}</div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(f)}
                    disabled={uploading}
                    className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50 flex items-center justify-center text-xs"
                  >
                    <FaTimes className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload button */}
            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-emerald-700">
                {files.filter((f) => f.uploaded).length}/{files.length} đã tải
                lên
              </div>
              <button
                onClick={uploadAll}
                disabled={
                  uploading || files.every((f) => f.uploaded || f.error)
                }
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {uploading ? "Đang tải lên..." : "Tải lên tất cả"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
