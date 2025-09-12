import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SUGGESTIONS = [
  "đậu hũ",
  "salad",
  "súp bí đỏ",
  "bún",
  "quinoa",
  "gỏi",
  "cháo",
  "nấm",
];

export default function SearchHero({ onSubmitKeyword }) {
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialQ = params.get("query") || params.get("q") || "";
  const [value, setValue] = useState(initialQ);
  const [focusSug, setFocusSug] = useState(-1);

  useEffect(() => {
    setValue(initialQ);
  }, [initialQ]);

  const doSearch = (kw) => {
    const q = (kw ?? value).trim();
    if (!q) return;
    // store recent keywords
    const recents = JSON.parse(localStorage.getItem("recent_keywords") || "[]");
    const updated = [q, ...recents.filter((k) => k !== q)].slice(0, 8);
    localStorage.setItem("recent_keywords", JSON.stringify(updated));
    if (onSubmitKeyword) onSubmitKeyword(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusSug((p) => (p + 1) % SUGGESTIONS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusSug((p) => (p - 1 < 0 ? SUGGESTIONS.length - 1 : p - 1));
    } else if (e.key === "Enter") {
      if (focusSug >= 0) {
        doSearch(SUGGESTIONS[focusSug]);
      } else {
        doSearch();
      }
    } else if (e.key === "Escape") {
      setFocusSug(-1);
    }
  };

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-brand text-lime-50 p-8 md:p-14 shadow-brand mb-10"
      aria-label="Khu vực tìm kiếm chính"
    >
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
          Tìm kiếm công thức
        </h1>
        <p className="text-lime-100/80 text-sm md:text-base leading-relaxed">
          Gõ từ khóa hoặc chọn gợi ý để khám phá món chay phù hợp khẩu vị.
        </p>
        <div className="space-y-3">
          <div className="relative">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setFocusSug(-1);
              }}
              onKeyDown={onKeyDown}
              placeholder="Ví dụ: đậu hũ, salad, súp bí đỏ..."
              className="w-full md:w-[580px] rounded-2xl bg-white/15 backdrop-blur border border-lime-200/30 px-5 pl-14 py-5 text-base md:text-lg placeholder:lime-100/60 text-lime-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-lime-300 focus:bg-white/25"
              aria-label="Từ khóa tìm kiếm"
            />
            <span
              className="absolute left-5 top-1/2 -translate-y-1/2 text-lime-100/70 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </span>
            <button
              onClick={() => doSearch()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-300 text-emerald-950 font-semibold text-sm md:text-base px-6 py-3 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-lime-200"
              aria-label="Thực hiện tìm kiếm"
            >
              Tìm
            </button>
          </div>
          <ul className="flex flex-wrap gap-2 text-xs" aria-label="Gợi ý nhanh">
            {SUGGESTIONS.map((s, idx) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => doSearch(s)}
                  className={`px-3 py-1.5 rounded-full font-medium border text-lime-50/90 transition focus:outline-none focus:ring-2 focus:ring-lime-200/70 ${
                    focusSug === idx
                      ? "bg-lime-300 text-emerald-900 border-transparent"
                      : "border-lime-200/30 bg-white/10 hover:bg-white/20"
                  }`}
                  aria-selected={focusSug === idx}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className="absolute -right-10 -bottom-10 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-lime-200/10 to-transparent border border-lime-200/20 blur-2xl"
        aria-hidden="true"
      />
    </section>
  );
}
