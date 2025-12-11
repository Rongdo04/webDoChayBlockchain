/** MediaGrid - API Integr          <tbody>
         return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((it) => (
        <MediaItem
          key={it._id || it.id}
          item={it}
          view="grid"
          selected={selectedIds.includes(it._id || it.id)}
          onSelectToggle={() => onSelectToggle(it._id || it.id)}
          onUpdate={onUpdateMedia}
        />
      ))}
    </div>
  );ap((it) => (
              <MediaItem
                key={it._id || it.id}
                item={it}
                view={view}
                selected={selectedIds.includes(it._id || it.id)}
                onSelectToggle={() => onSelectToggle(it._id || it.id)}
                onUpdate={onUpdateMedia}
              />
            ))}
          </tbody>rops: { items, view, selectedIds, onSelectToggle, onUpdateMedia }
 */
import React from "react";
import MediaItem from "./MediaItem.jsx";

export default function MediaGrid({
  items = [],
  selectedIds = [],
  onSelectToggle,
  onUpdateMedia,
  onPreview,
}) {
  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items
        .filter((item) => item && item.id)
        .map((it) => (
          <MediaItem
            key={it.id}
            item={it}
            view="grid"
            selected={selectedIds.includes(it.id)}
            onSelectToggle={onSelectToggle}
            onUpdate={onUpdateMedia}
            onPreview={onPreview}
          />
        ))}
    </div>
  );
}
