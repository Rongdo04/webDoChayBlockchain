import React, { useState } from "react";

export default function StepIngredients({ data, onChange, errors }) {
  const [input, setInput] = useState("");

  const addIng = () => {
    if (!input.trim()) return;

    // Create ingredient object compatible with backend model
    const newIngredient = {
      name: input.trim(),
      amount: "",
      unit: "",
      notes: "",
    };

    onChange({ ...data, ingredients: [...data.ingredients, newIngredient] });
    setInput("");
  };

  const updateIng = (idx, field, val) => {
    const list = [...data.ingredients];
    if (typeof list[idx] === "string") {
      // Convert old string format to object format
      list[idx] = {
        name: list[idx],
        amount: "",
        unit: "",
        notes: "",
      };
    }
    list[idx] = { ...list[idx], [field]: val };
    onChange({ ...data, ingredients: list });
  };

  const removeIng = (idx) => {
    onChange({
      ...data,
      ingredients: data.ingredients.filter((_, i) => i !== idx),
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-emerald-900">
          Nguyên liệu *
        </h3>
        <p className="text-xs text-emerald-700/70">
          Thêm tối thiểu 1 nguyên liệu. Giữ ngắn gọn và định lượng rõ ràng.
        </p>
        {errors.ingredients && (
          <p className="text-[11px] text-rose-600 font-medium">
            {errors.ingredients}
          </p>
        )}
      </header>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ví dụ: 200g đậu hũ non"
          className="input flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addIng();
            }
          }}
        />
        <button type="button" onClick={addIng} className="btn-brand">
          Thêm
        </button>
      </div>
      {data.ingredients.length === 0 && (
        <p className="text-xs text-emerald-700/70">Chưa có nguyên liệu nào.</p>
      )}
      <ul className="space-y-2">
        {data.ingredients.map((ing, idx) => {
          // Handle both old string format and new object format
          const ingredientName = typeof ing === "string" ? ing : ing.name || "";

          return (
            <li key={idx} className="flex gap-2 items-start">
              <input
                value={ingredientName}
                onChange={(e) => updateIng(idx, "name", e.target.value)}
                className="input flex-1"
                placeholder="Tên nguyên liệu"
              />
              <button
                type="button"
                onClick={() => removeIng(idx)}
                className="px-3 py-2 rounded-xl text-xs font-medium bg-rose-600 text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                Xoá
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
