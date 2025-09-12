import React from "react";
import { testimonials } from "../../data";

export default function Testimonials() {
  const list = testimonials.slice(0, 3);
  return (
    <section className="space-y-8" aria-labelledby="testimonials-title">
      <h2
        id="testimonials-title"
        className="text-lg font-semibold tracking-tight text-emerald-950"
      >
        Người dùng nói gì
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {list.map((t) => (
          <figure
            key={t.id}
            className="relative rounded-2xl bg-white border border-emerald-900/10 shadow-sm p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-12 h-12 rounded-full object-cover border border-emerald-900/10"
                loading="lazy"
              />
              <figcaption className="text-sm font-medium text-emerald-950">
                {t.name}
              </figcaption>
            </div>
            <blockquote className="text-sm text-emerald-800/80 leading-relaxed">
              “{t.quote}”
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}
