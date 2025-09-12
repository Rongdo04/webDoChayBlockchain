import React, { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setEmail("");
  };
  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 p-10 text-lime-50 shadow-brand"
      aria-labelledby="newsletter-title"
    >
      <div className="max-w-xl space-y-6">
        <h2
          id="newsletter-title"
          className="text-2xl font-semibold tracking-tight"
        >
          Nhận công thức mới mỗi tuần
        </h2>
        <p className="text-lime-100/80 text-sm leading-relaxed">
          Đăng ký nhận bản tin: tổng hợp món chay tiêu biểu & mẹo nấu ăn ngắn
          gọn dễ áp dụng.
        </p>
        <form
          onSubmit={submit}
          className="flex flex-col sm:flex-row gap-3"
          aria-label="Đăng ký newsletter"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            aria-label="Email"
            className="flex-1 rounded-xl bg-white/10 border border-lime-200/30 px-4 py-3 text-sm placeholder:lime-100/50 focus:outline-none focus:ring-2 focus:ring-lime-300 focus:bg-white/20"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-lime-300 via-lime-400 to-emerald-300 text-emerald-950 shadow hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-lime-200"
          >
            Đăng ký
          </button>
        </form>
        {submitted && (
          <div
            role="status"
            aria-live="polite"
            className="text-sm text-lime-200"
          >
            Cảm ơn! Bạn sẽ nhận email sớm.
          </div>
        )}
      </div>
      <div
        className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-lime-300/10 blur-2xl"
        aria-hidden="true"
      />
    </section>
  );
}
