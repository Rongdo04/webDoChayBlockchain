import React from "react";

const items = [
  {
    id: 1,
    title: "Dinh dưỡng cân bằng",
    text: "Công thức tối ưu tỉ lệ đạm thực vật – chất xơ – vi chất.",
    icon: "🥦",
  },
  {
    id: 2,
    title: "Nhanh & linh hoạt",
    text: "Nhiều món < 30 phút phù hợp bữa bận rộn.",
    icon: "⚡",
  },
  {
    id: 3,
    title: "Hương vị bản địa",
    text: "Giữ nét quen thuộc, dễ hợp khẩu vị gia đình.",
    icon: "🍲",
  },
  {
    id: 4,
    title: "Truyền cảm hứng",
    text: "Gợi ý thực đơn & mẹo nhỏ giúp đa dạng hóa bữa ăn.",
    icon: "✨",
  },
];

export default function ValueProps() {
  return (
    <section className="space-y-8" aria-labelledby="usp-title">
      <h2
        id="usp-title"
        className="text-lg font-semibold tracking-tight text-emerald-950"
      >
        Vì sao chọn chúng tôi?
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.id}
            className="p-5 rounded-2xl bg-white border border-emerald-900/10 shadow-sm hover:shadow-brand transition"
          >
            <div className="text-2xl mb-3" aria-hidden="true">
              {it.icon}
            </div>
            <h3 className="text-sm font-semibold text-emerald-950 mb-1">
              {it.title}
            </h3>
            <p className="text-xs text-emerald-800/70 leading-relaxed">
              {it.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
