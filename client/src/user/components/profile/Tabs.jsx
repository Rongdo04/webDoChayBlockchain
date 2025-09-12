import React from "react";

export default function Tabs({ active, onChange }) {
  const tabs = [
    { key: "favorites", label: "Yêu thích" },
    { key: "my", label: "Công thức của tôi" },
  ];
  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Phân vùng hồ sơ"
    >
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange?.(t.key)}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition focus:outline-none focus:ring-2 focus:ring-emerald-600/50 ${
            active === t.key
              ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-100 border-transparent shadow"
              : "bg-white text-emerald-900/70 border-emerald-900/15 hover:bg-emerald-900/5"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
