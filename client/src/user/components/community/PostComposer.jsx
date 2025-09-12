import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";

export default function PostComposer({ onPost }) {
  const { user, isAuthenticated } = useAuth();
  const [text, setText] = useState("");
  const [tag, setTag] = useState("Kinh nghiệm");
  const tags = ["Kinh nghiệm", "Hỏi đáp", "Món mới", "Nguyên liệu"];

  const submit = (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;

    const postUser =
      isAuthenticated && user
        ? {
            id: user.id || user._id,
            name: user.name || user.username,
            avatar: user.avatar || "https://placehold.co/80x80?text=U",
          }
        : {
            id: "u_local",
            name: "Người dùng ẩn danh",
            avatar: "https://placehold.co/80x80?text=U",
          };

    onPost?.({
      id: Date.now(),
      user: postUser,
      tag,
      content,
      createdAt: new Date().toISOString(),
    });
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className="p-5 rounded-2xl border border-emerald-900/10 bg-white shadow-sm space-y-4"
      aria-label="Tạo bài viết"
    >
      <div className="flex items-start gap-4">
        <img
          src={
            isAuthenticated && user?.avatar
              ? user.avatar
              : "https://placehold.co/64x64?text=U"
          }
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-900/10"
        />
        <div className="flex-1 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Chia sẻ mẹo, câu hỏi hoặc món bạn thử..."
            className="w-full resize-none rounded-xl border border-emerald-900/20 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
            aria-label="Nội dung bài"
          />
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/50"
              aria-label="Chọn thẻ"
            >
              {tags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!text.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 px-5 py-2 text-sm font-semibold text-lime-100 shadow focus:outline-none focus:ring-2 focus:ring-emerald-600/60 disabled:opacity-50"
              aria-label="Đăng bài"
            >
              Đăng
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
