import React, { useState, useEffect } from "react";
import { FaCheck, FaClock, FaThermometerHalf } from "react-icons/fa";

export default function Steps({ steps = [] }) {
  const [done, setDone] = useState(() => new Set());
  useEffect(() => setDone(new Set()), [steps]);

  const toggle = (id) => {
    setDone((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  return (
    <div className="space-y-3" aria-labelledby="steps-title">
      <h3
        id="steps-title"
        className="text-sm font-semibold uppercase tracking-wide text-emerald-900/70"
      >
        Hướng dẫn thực hiện
      </h3>
      <ol className="space-y-3">
        {steps.map((s, idx) => {
          const finished = done.has(s.id || idx);
          return (
            <li
              key={s.id || idx}
              className={`p-4 rounded-xl border text-sm leading-relaxed bg-white shadow-sm flex gap-3 items-start border-emerald-900/10 ${
                finished ? "opacity-60" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(s.id || idx)}
                aria-label={
                  finished
                    ? `Bỏ đánh dấu bước ${idx + 1}`
                    : `Đánh dấu hoàn thành bước ${idx + 1}`
                }
                className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold transition border ${
                  finished
                    ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-200 border-transparent"
                    : "bg-white border-emerald-900/20 text-emerald-700 hover:bg-emerald-900/10"
                }`}
              >
                {finished ? <FaCheck className="w-3 h-3" /> : idx + 1}
              </button>
              <div className="flex-1 text-emerald-900/90 whitespace-pre-line">
                {s.description ||
                  s.text ||
                  (typeof s === "string" ? s : "Bước thực hiện")}
                {s.duration && s.duration > 0 && (
                  <div className="mt-2 text-xs text-emerald-700 font-medium">
                    <FaClock className="inline w-3 h-3 mr-1" /> {s.duration} phút
                  </div>
                )}
                {s.temperature && (
                  <div className="mt-1 text-xs text-emerald-700">
                    <FaThermometerHalf className="inline w-3 h-3 mr-1" /> {s.temperature}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {steps.length === 0 && (
        <p className="text-xs text-emerald-800/60">
          Chưa có hướng dẫn thực hiện.
        </p>
      )}
    </div>
  );
}
