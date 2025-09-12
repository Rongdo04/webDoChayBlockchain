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
  view = "grid",
  selectedIds = [],
  onSelectToggle,
  onUpdateMedia,
}) {
  if (view === "list") {
    return (
      <div className="overflow-auto border border-emerald-900/15 rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-emerald-950/90 text-white text-left text-xs uppercase tracking-wide">
            <tr>
              <th className="px-3 py-2 w-8"></th>
              <th className="px-3 py-2">Preview</th>
              <th className="px-3 py-2">Filename</th>
              <th className="px-3 py-2">Alt</th>
              <th className="px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <MediaItem
                key={it.id}
                item={it}
                view="list"
                selected={selectedIds.includes(it.id)}
                onSelect={onSelectToggle}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

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
          />
        ))}
    </div>
  );
}
