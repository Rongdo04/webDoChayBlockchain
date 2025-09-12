import React, { useState, useEffect } from "react";

export default function IngredientsChecklist({ list = [] }) {
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    setChecked(new Set());
  }, [list]);

  const toggle = (item) => {
    setChecked((prev) => {
      const n = new Set(prev);
      if (n.has(item)) n.delete(item);
      else n.add(item);
      return n;
    });
  };

  return (
    <div className="space-y-3" aria-labelledby="ingredients-title">
      <h3
        id="ingredients-title"
        className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70"
      >
        Nguyên liệu
      </h3>
      <ul className="space-y-2">
        {list.map((ing, idx) => {
          const id = `ing-${idx}`;
          const done = checked.has(ing);

          // Handle both string and object ingredients
          const displayText =
            typeof ing === "string"
              ? ing
              : `${ing.name}${ing.amount ? ` - ${ing.amount}` : ""}${
                  ing.unit ? ` ${ing.unit}` : ""
                }${ing.notes ? ` (${ing.notes})` : ""}`;

          return (
            <li key={idx} className="flex items-start gap-3">
              <input
                id={id}
                type="checkbox"
                checked={done}
                onChange={() => toggle(ing)}
                className="mt-1 accent-lime-400"
                aria-label={`Đánh dấu nguyên liệu: ${displayText}`}
              />
              <label
                htmlFor={id}
                className={`text-sm leading-snug select-none ${
                  done
                    ? "line-through text-emerald-800/40"
                    : "text-emerald-900/90"
                }`}
              >
                {displayText}
              </label>
            </li>
          );
        })}
      </ul>
      {list.length === 0 && (
        <p className="text-xs text-emerald-800/60">
          Chưa có thông tin nguyên liệu.
        </p>
      )}
    </div>
  );
}
