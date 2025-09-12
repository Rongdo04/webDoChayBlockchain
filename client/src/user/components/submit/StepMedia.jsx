import React from "react";
import UploadDropzone from "../media/UploadDropzone.jsx";

export default function StepMedia({ data, onChange }) {
  const update = (field, value) => onChange({ ...data, [field]: value });
  return (
    <div className="space-y-6">
      <section className="p-5 rounded-2xl border border-emerald-900/10 bg-white shadow-sm space-y-4">
        <header>
          <h3 className="text-sm font-semibold text-emerald-900">Hình ảnh</h3>
          <p className="text-xs text-emerald-700/70">
            Tải lên một vài ảnh đại diện món ăn.
          </p>
        </header>
        <UploadDropzone
          images={data.images}
          onChange={(imgs) => update("images", imgs)}
        />
      </section>
    </div>
  );
}
