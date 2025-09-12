import React, { useEffect, useState } from "react";

export default function RecentKeywords({ onSelect }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("recent_keywords") || "[]"
      );
      setItems(stored);
    } catch {
      setItems([]);
    }
  }, []);

  if (!items.length) return null;

  return (
    <div className="space-y-2" aria-labelledby="recent-kw-title">
      <h3
        id="recent-kw-title"
        className="text-xs font-semibold uppercase tracking-wide text-emerald-900/70"
      >
        Từ khóa gần đây
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((k) => (
          <button
            key={k}
            onClick={() => onSelect?.(k)}
            className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-900/5 hover:bg-emerald-900/10 text-emerald-900/80 border border-emerald-900/10 focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
            aria-label={`Tìm với từ khóa ${k}`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
