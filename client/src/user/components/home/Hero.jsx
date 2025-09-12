import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const submit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand text-lime-50 p-8 md:p-14 shadow-brand">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight">
          Ăn chay ngon mỗi ngày
        </h1>
        <p className="text-lime-100/80 text-sm md:text-base leading-relaxed max-w-xl">
          Khám phá hàng trăm công thức chay đơn giản, đủ dưỡng chất và đầy cảm
          hứng cho bữa ăn gia đình bạn.
        </p>
        <form
          onSubmit={submit}
          role="search"
          aria-label="Tìm kiếm công thức"
          className="relative group"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm món: đậu hũ, súp bí đỏ, salad..."
            className="w-full md:w-[520px] rounded-2xl bg-white/15 backdrop-blur border border-lime-200/30 px-5 pl-12 py-4 text-base md:text-lg placeholder:lime-100/60 text-lime-50 shadow-inner focus:outline-none focus:ring-2 focus:ring-lime-300 focus:bg-white/25"
            aria-label="Từ khóa tìm kiếm"
          />
          <span
            className="absolute left-5 top-1/2 -translate-y-1/2 text-lime-100/70 pointer-events-none"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
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
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-300 text-emerald-950 font-semibold text-sm md:text-base px-5 py-2 rounded-xl shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-lime-200"
            aria-label="Thực hiện tìm kiếm"
          >
            Tìm
          </button>
        </form>
      </div>
      <div
        className="absolute -right-10 -bottom-10 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-lime-200/10 to-transparent border border-lime-200/20 blur-2xl"
        aria-hidden="true"
      />
    </section>
  );
}
