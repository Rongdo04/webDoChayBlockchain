import React from "react";
import { FaClock, FaStar, FaSortAlphaDown, FaFire, FaCalendarAlt } from "react-icons/fa";
import { GiNewBorn } from "react-icons/gi";

export default function SortBar({ sort, onSort, total }) {
  const sortOptions = [
    { value: "newest", label: "Mới nhất", icon: GiNewBorn },
    { value: "oldest", label: "Cũ nhất", icon: FaCalendarAlt },
    { value: "rating", label: "Đánh giá cao", icon: FaStar },
    { value: "rating-low", label: "Đánh giá thấp", icon: FaStar },
    { value: "time-asc", label: "Thời gian ít", icon: FaClock },
    { value: "time-desc", label: "Thời gian nhiều", icon: FaClock },
    { value: "title", label: "A-Z", icon: FaSortAlphaDown },
    { value: "popular", label: "Phổ biến", icon: FaFire },
  ];

  return (
    <div className="flex items-center justify-between p-3 bg-white border border-emerald-900/10 rounded-lg shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-emerald-800/70">
          Sắp xếp:
        </span>
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="px-3 py-1.5 rounded-md border border-emerald-900/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-lime-400"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="text-xs text-emerald-800/60">{total} công thức</div>
    </div>
  );
}
