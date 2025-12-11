/** MediaItem - API Integration
 * Props: { item, selected, onSelectToggle, onUpdate, view } // view: 'grid' | 'list'
 */
import React, { useState } from "react";

export default function MediaItem({
  item,
  selected,
  onSelectToggle,
  onUpdate,
  view,
  onPreview,
}) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    alt: item.alt || "",
    tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
  });

  const handleSave = async () => {
    const updates = {
      alt: editData.alt.trim(),
      tags: editData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    if (onUpdate) {
      await onUpdate(item._id || item.id, updates);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      alt: item.alt || "",
      tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags || "",
    });
    setEditing(false);
  };

  const clsSelected = selected ? "ring-2 ring-lime-400 ring-offset-2" : "";

  // Removed list view

  // Grid view
  return (
    <div
      className={`relative group rounded-xl overflow-hidden border border-emerald-900/15 bg-white shadow-sm hover:shadow-brand transition ${clsSelected}`}
    >
      {/* Checkbox */}
      <div className="absolute top-2 left-2 z-10">
        <input
          type="checkbox"
          className="accent-lime-400"
          checked={selected}
          onChange={() => onSelectToggle(item.id || item._id)}
          aria-label={`Select ${item.filename}`}
        />
      </div>

      {/* Edit button */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={() => setEditing(true)}
          className="px-2 py-1 text-xs bg-white/90 text-emerald-700 rounded hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          Sửa
        </button>
      </div>

      {/* Media preview (click to open) */}
      <div
        className="aspect-video w-full bg-emerald-900/5 flex items-center justify-center text-[10px] text-emerald-700 cursor-pointer"
        onClick={() => onPreview && onPreview(item)}
        title={item.originalName}
      >
        {item.type === "image" || item.type === "video" ? (
          <img
            src={item.thumbnailUrl || item.url}
            alt={item.alt || item.originalName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.textContent =
                item.type === "video" ? "VIDEO" : "IMG";
            }}
          />
        ) : (
          <span className="text-xs font-medium">MEDIA</span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1">
        <div
          className="text-xs font-medium text-emerald-900 truncate"
          title={item.originalName}
        >
          {item.originalName}
        </div>
        <div className="text-xs text-emerald-700/70 truncate" title={item.alt}>
          {item.alt || "Chưa có mô tả"}
        </div>
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {(Array.isArray(item.tags) ? item.tags : [item.tags])
              .slice(0, 2)
              .map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded"
                >
                  {tag}
                </span>
              ))}
            {(Array.isArray(item.tags) ? item.tags : [item.tags]).length >
              2 && (
              <span className="text-xs text-emerald-500">
                +
                {(Array.isArray(item.tags) ? item.tags : [item.tags]).length -
                  2}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col p-3 z-20">
          <div className="space-y-3 flex-1">
            <div>
              <label className="text-xs font-medium text-emerald-900">
                Alt text
              </label>
              <input
                type="text"
                value={editData.alt}
                onChange={(e) =>
                  setEditData({ ...editData, alt: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-emerald-200 rounded mt-1"
                placeholder="Mô tả ảnh..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-emerald-900">
                Tags
              </label>
              <input
                type="text"
                value={editData.tags}
                onChange={(e) =>
                  setEditData({ ...editData, tags: e.target.value })
                }
                className="w-full px-2 py-1 text-xs border border-emerald-200 rounded mt-1"
                placeholder="tag1, tag2, tag3..."
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-500"
            >
              Lưu
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
