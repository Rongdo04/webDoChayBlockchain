import React from "react";

export default function ReviewSubmit({
  data,
  onEditStep,
  onSaveDraft,
  onSubmit,
  submitting,
}) {
  const totalTime = (data.durationPrep || 0) + (data.durationCook || 0);
  return (
    <div className="space-y-6">
      <header className="bg-brand text-white rounded-2xl p-6 shadow-brand">
        <h2 className="text-lg font-semibold">Xem trước</h2>
        <p className="text-sm text-white/80 mt-1">
          Kiểm tra lại thông tin trước khi gửi duyệt.
        </p>
      </header>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <InfoCard data={data} onEditStep={onEditStep} />
          <IngredientsCard data={data} onEditStep={onEditStep} />
          <StepsCard data={data} onEditStep={onEditStep} />
          <MediaCard data={data} onEditStep={onEditStep} />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-20 h-fit">
          <div className="p-5 rounded-2xl border border-emerald-900/10 bg-white shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-emerald-900">Tóm tắt</h3>
            <ul className="text-xs text-emerald-800 space-y-1">
              <li>
                Tiêu đề: <strong>{data.title || "—"}</strong>
              </li>
              <li>Thời gian: {totalTime} phút</li>
              <li>Khẩu phần: {data.servings || "—"}</li>
              <li>Nguyên liệu: {data.ingredients.length}</li>
              <li>Bước: {data.steps.length}</li>
            </ul>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onSaveDraft}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-900 focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                Lưu nháp
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={onSubmit}
                className="flex-1 btn-brand disabled:opacity-50"
              >
                {submitting ? "Đang gửi..." : "Gửi duyệt"}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CardShell({ title, step, onEdit, children }) {
  return (
    <section className="p-5 rounded-2xl border border-emerald-900/10 bg-white shadow-sm space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-emerald-900">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-xs font-medium text-emerald-700 hover:underline"
        >
          Chỉnh sửa
        </button>
      </header>
      {children}
    </section>
  );
}

const InfoCard = ({ data, onEditStep }) => (
  <CardShell title="Thông tin" step={0} onEdit={onEditStep}>
    <p className="text-sm font-medium text-emerald-900">{data.title || "—"}</p>
    <p className="text-xs text-emerald-700/80 line-clamp-3">
      {data.description || "—"}
    </p>
    <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
      {data.category && <span className="badge-brand">{data.category}</span>}
      {data.dietType && <span className="badge-brand">{data.dietType}</span>}
      {data.difficulty && (
        <span className="badge-brand">Độ khó: {data.difficulty}</span>
      )}
    </div>
  </CardShell>
);

const IngredientsCard = ({ data, onEditStep }) => (
  <CardShell title="Nguyên liệu" step={1} onEdit={onEditStep}>
    <ul className="text-xs space-y-1 list-disc list-inside text-emerald-800">
      {data.ingredients.map((i, idx) => {
        // Handle both old string format and new object format
        const ingredientText = typeof i === "string" ? i : i.name || "";
        return <li key={idx}>{ingredientText}</li>;
      })}
      {data.ingredients.length === 0 && <li>—</li>}
    </ul>
  </CardShell>
);

const StepsCard = ({ data, onEditStep }) => (
  <CardShell title="Các bước" step={2} onEdit={onEditStep}>
    <ol className="text-xs space-y-1 list-decimal list-inside text-emerald-800">
      {data.steps.map((s, idx) => {
        // Handle both old string format and new object format
        const stepText = typeof s === "string" ? s : s.description || "";
        return <li key={idx}>{stepText}</li>;
      })}
      {data.steps.length === 0 && <li>—</li>}
    </ol>
  </CardShell>
);

const MediaCard = ({ data, onEditStep }) => (
  <CardShell title="Media" step={3} onEdit={onEditStep}>
    {data.images.length > 0 ? (
      <ul className="grid grid-cols-3 gap-2">
        {data.images.map((image, idx) => {
          // Handle both old string format and new object format
          const imageUrl = typeof image === "string" ? image : image.url;
          return (
            <li key={idx}>
              <img
                src={imageUrl}
                alt={`Ảnh ${idx + 1}`}
                className="w-full h-20 object-cover rounded-xl border border-emerald-900/10"
              />
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="text-xs text-emerald-700/70">Chưa có hình ảnh.</p>
    )}
    {data.videoUrl && (
      <p className="text-xs text-emerald-800 mt-2">Video: {data.videoUrl}</p>
    )}
  </CardShell>
);
