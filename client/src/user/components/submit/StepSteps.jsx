import React, { useState } from "react";

export default function StepSteps({ data, onChange, errors }) {
  const [input, setInput] = useState("");

  const addStep = () => {
    if (!input.trim()) return;

    // Create step object compatible with backend model
    const newStep = {
      order: data.steps.length + 1,
      title: "",
      description: input.trim(),
      duration: 0,
      temperature: "",
      images: [],
    };

    onChange({ ...data, steps: [...data.steps, newStep] });
    setInput("");
  };

  const updateStep = (idx, field, val) => {
    const list = [...data.steps];
    if (typeof list[idx] === "string") {
      // Convert old string format to object format
      list[idx] = {
        order: idx + 1,
        title: "",
        description: list[idx],
        duration: 0,
        temperature: "",
        images: [],
      };
    }
    list[idx] = { ...list[idx], [field]: val };
    onChange({ ...data, steps: list });
  };

  const removeStep = (idx) => {
    const newSteps = data.steps.filter((_, i) => i !== idx);
    // Update order numbers after removal
    const reorderedSteps = newSteps.map((step, index) => {
      if (typeof step === "object") {
        return { ...step, order: index + 1 };
      }
      return step;
    });
    onChange({ ...data, steps: reorderedSteps });
  };

  const move = (idx, dir) => {
    const list = [...data.steps];
    const target = idx + dir;
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];

    // Update order numbers after moving
    const reorderedSteps = list.map((step, index) => {
      if (typeof step === "object") {
        return { ...step, order: index + 1 };
      }
      return step;
    });
    onChange({ ...data, steps: reorderedSteps });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h3 className="text-sm font-semibold text-emerald-900">Các bước *</h3>
        <p className="text-xs text-emerald-700/70">
          Mô tả rõ ràng, mỗi hành động một bước.
        </p>
        {errors.steps && (
          <p className="text-[11px] text-rose-600 font-medium">
            {errors.steps}
          </p>
        )}
      </header>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ví dụ: Phi thơm hành, thêm cà chua..."
          className="input flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addStep();
            }
          }}
        />
        <button type="button" onClick={addStep} className="btn-brand">
          Thêm
        </button>
      </div>
      {data.steps.length === 0 && (
        <p className="text-xs text-emerald-700/70">Chưa có bước nào.</p>
      )}
      <ol className="space-y-3 list-decimal list-inside">
        {data.steps.map((st, idx) => {
          // Handle both old string format and new object format
          const stepDescription =
            typeof st === "string" ? st : st.description || "";

          return (
            <li key={idx} className="space-y-2">
              <div className="flex gap-2 items-start">
                <textarea
                  value={stepDescription}
                  onChange={(e) =>
                    updateStep(idx, "description", e.target.value)
                  }
                  className="input flex-1 min-h-[72px]"
                  placeholder="Mô tả bước thực hiện"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs"
                    aria-label="Lên"
                    disabled={idx === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs"
                    aria-label="Xuống"
                    disabled={idx === data.steps.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(idx)}
                    className="px-2 py-1 rounded-lg bg-rose-600 text-white text-xs"
                  >
                    Xoá
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
