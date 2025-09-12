/** RecipeStepsStep
 * Props: { data, onChange, errors }
 * Structure: { order, title, description, duration, temperature, images }
 */
import React, { useState } from "react";

export default function RecipeStepsStep({ data, onChange, errors = {} }) {
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    duration: "",
    temperature: "",
  });

  const add = () => {
    if (!draft.description.trim()) return;
    const newStep = {
      _id: Date.now() + "" + Math.random(),
      order: data.steps.length + 1,
      title: draft.title.trim(),
      description: draft.description.trim(),
      duration: parseInt(draft.duration) || 0,
      temperature: draft.temperature.trim(),
      images: [],
    };
    onChange({
      ...data,
      steps: [...data.steps, newStep],
    });
    setDraft({ title: "", description: "", duration: "", temperature: "" });
  };

  const remove = (id) => {
    const filteredSteps = data.steps.filter((s) => s._id !== id);
    // Reorder steps
    const reorderedSteps = filteredSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));
    onChange({ ...data, steps: reorderedSteps });
  };

  const update = (id, field, value) => {
    const updatedSteps = data.steps.map((s) =>
      s._id === id
        ? { ...s, [field]: field === "duration" ? parseInt(value) || 0 : value }
        : s
    );
    onChange({ ...data, steps: updatedSteps });
  };

  const move = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= data.steps.length) return;
    const list = data.steps.slice();
    const [item] = list.splice(idx, 1);
    list.splice(target, 0, item);

    // Update order after move
    const reorderedSteps = list.map((step, index) => ({
      ...step,
      order: index + 1,
    }));
    onChange({ ...data, steps: reorderedSteps });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Thêm bước thực hiện mới
        </h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-gray-600">
              Tiêu đề bước (tùy chọn)
            </label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="input text-sm"
              placeholder="Chuẩn bị nguyên liệu"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Thời gian (phút)</label>
              <input
                type="number"
                min="0"
                value={draft.duration}
                onChange={(e) =>
                  setDraft({ ...draft, duration: e.target.value })
                }
                className="input text-sm"
                placeholder="15"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">
                Nhiệt độ (tùy chọn)
              </label>
              <input
                value={draft.temperature}
                onChange={(e) =>
                  setDraft({ ...draft, temperature: e.target.value })
                }
                className="input text-sm"
                placeholder="180°C"
              />
            </div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <label className="text-xs text-gray-600">Mô tả bước thực hiện</label>
          <textarea
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
            className="input text-sm min-h-[80px] resize-y"
            placeholder="Mô tả chi tiết cách thực hiện bước này..."
          />
        </div>
        <button
          type="button"
          className="btn-brand mt-3"
          onClick={add}
          disabled={!draft.description.trim()}
        >
          Thêm bước
        </button>
      </div>

      {errors.steps && <p className="text-xs text-red-600">{errors.steps}</p>}

      <div className="space-y-4">
        {data.steps.map((step, idx) => (
          <div key={step._id || idx} className="bg-white border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2 py-1 rounded">
                  Bước {step.order}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === data.steps.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-25 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => remove(step._id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Xóa
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-600">
                  Tiêu đề bước (tùy chọn)
                </label>
                <input
                  value={step.title || ""}
                  onChange={(e) => update(step._id, "title", e.target.value)}
                  className="input text-sm"
                  placeholder="Tiêu đề cho bước này"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">
                    Thời gian (phút)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={step.duration || ""}
                    onChange={(e) =>
                      update(step._id, "duration", e.target.value)
                    }
                    className="input text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">Nhiệt độ</label>
                  <input
                    value={step.temperature || ""}
                    onChange={(e) =>
                      update(step._id, "temperature", e.target.value)
                    }
                    className="input text-sm"
                    placeholder="180°C"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <label className="text-xs text-gray-600">
                Mô tả bước thực hiện
              </label>
              <textarea
                value={step.description || ""}
                onChange={(e) =>
                  update(step._id, "description", e.target.value)
                }
                className="input text-sm min-h-[80px] resize-y"
                placeholder="Mô tả chi tiết cách thực hiện..."
              />
            </div>
          </div>
        ))}
      </div>

      {data.steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có bước thực hiện nào được thêm</p>
          <p className="text-sm">
            Hãy thêm bước đầu tiên cho công thức của bạn
          </p>
        </div>
      )}
    </div>
  );
}
