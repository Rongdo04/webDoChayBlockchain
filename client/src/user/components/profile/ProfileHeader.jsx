import React from "react";

export default function ProfileHeader({ user, onEdit }) {
  return (
    <div className="p-6 rounded-2xl border border-emerald-900/10 bg-white shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
      <div className="flex items-center gap-5">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-2xl object-cover ring-2 ring-emerald-900/10"
        />
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-emerald-950 leading-tight">
            {user.name}
          </h1>
          <p className="text-sm text-emerald-800/70 leading-snug max-w-prose">
            {user.bio || "Chưa có giới thiệu."}
          </p>
          <div className="flex flex-wrap gap-3 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-emerald-900/5 text-emerald-900/70 font-medium border border-emerald-900/10">
              Thành viên
            </span>
          </div>
        </div>
      </div>
      <div className="sm:ml-auto flex gap-3">
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-lime-100 shadow focus:outline-none focus:ring-2 focus:ring-emerald-600/60"
          aria-label="Chỉnh sửa hồ sơ"
        >
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
}
