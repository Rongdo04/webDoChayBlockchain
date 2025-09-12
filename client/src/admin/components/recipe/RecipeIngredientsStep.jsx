/** RecipeIngredientsStep
 * Props: { data, onChange, errors }
 * Structure: { name, amount, unit, notes }
 */
import React, { useState } from "react";

export default function RecipeIngredientsStep({ data, onChange, errors = {} }) {
  const [draft, setDraft] = useState({
    name: "",
    amount: "",
    unit: "",
    notes: "",
  });

  const add = () => {
    if (!draft.name.trim()) return;
    const newIngredient = {
      _id: Date.now() + "" + Math.random(),
      name: draft.name.trim(),
      amount: draft.amount.trim(),
      unit: draft.unit.trim(),
      notes: draft.notes.trim(),
    };
    onChange({ ...data, ingredients: [...data.ingredients, newIngredient] });
    setDraft({ name: "", amount: "", unit: "", notes: "" });
  };

  const remove = (idx) => {
    const list = data.ingredients.filter((_, i) => i !== idx);
    onChange({ ...data, ingredients: list });
  };

  const update = (idx, field, value) => {
    const list = data.ingredients.slice();
    list[idx] = { ...list[idx], [field]: value };
    onChange({ ...data, ingredients: list });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Thêm nguyên liệu mới
        </h3>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Tên nguyên liệu</label>
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="input text-sm"
              placeholder="Bánh tráng"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Số lượng</label>
            <input
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              className="input text-sm"
              placeholder="200"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Đơn vị</label>
            <select
              value={draft.unit}
              onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
              className="input text-sm"
            >
              <option value="">Chọn đơn vị</option>
              <option value="g">gram (g)</option>
              <option value="kg">kilogram (kg)</option>
              <option value="ml">mililít (ml)</option>
              <option value="l">lít (l)</option>
              <option value="cái">cái</option>
              <option value="quả">quả</option>
              <option value="củ">củ</option>
              <option value="muỗng canh">muỗng canh</option>
              <option value="muỗng cà phê">muỗng cà phê</option>
              <option value="chén">chén</option>
              <option value="tô">tô</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-gray-600">Ghi chú</label>
            <input
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              className="input text-sm"
              placeholder="Tươi, sạch"
            />
          </div>
        </div>
        <button
          type="button"
          className="btn-brand mt-3"
          onClick={add}
          disabled={!draft.name.trim()}
        >
          Thêm nguyên liệu
        </button>
      </div>

      {errors.ingredients && (
        <p className="text-xs text-red-600">{errors.ingredients}</p>
      )}

      <div className="space-y-3">
        {data.ingredients.map((ing, idx) => (
          <div key={ing._id || idx} className="bg-white border rounded-lg p-4">
            <div className="grid gap-3 md:grid-cols-4 items-start">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Tên nguyên liệu</label>
                <input
                  value={ing.name || ""}
                  onChange={(e) => update(idx, "name", e.target.value)}
                  className="input text-sm"
                  placeholder="Tên nguyên liệu"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Số lượng</label>
                <input
                  value={ing.amount || ""}
                  onChange={(e) => update(idx, "amount", e.target.value)}
                  className="input text-sm"
                  placeholder="Số lượng"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Đơn vị</label>
                <select
                  value={ing.unit || ""}
                  onChange={(e) => update(idx, "unit", e.target.value)}
                  className="input text-sm"
                >
                  <option value="">Chọn đơn vị</option>
                  <option value="g">gram (g)</option>
                  <option value="kg">kilogram (kg)</option>
                  <option value="ml">mililít (ml)</option>
                  <option value="l">lít (l)</option>
                  <option value="cái">cái</option>
                  <option value="quả">quả</option>
                  <option value="củ">củ</option>
                  <option value="muỗng canh">muỗng canh</option>
                  <option value="muỗng cà phê">muỗng cà phê</option>
                  <option value="chén">chén</option>
                  <option value="tô">tô</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-600">Ghi chú</label>
                <div className="flex gap-2">
                  <input
                    value={ing.notes || ""}
                    onChange={(e) => update(idx, "notes", e.target.value)}
                    className="input text-sm flex-1"
                    placeholder="Ghi chú"
                  />
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200 hover:border-red-300 text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.ingredients.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có nguyên liệu nào được thêm</p>
          <p className="text-sm">
            Hãy thêm nguyên liệu đầu tiên cho công thức của bạn
          </p>
        </div>
      )}
    </div>
  );
}
