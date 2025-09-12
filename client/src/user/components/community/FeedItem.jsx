import React from "react";

export default function FeedItem({ post, onReport }) {
  return (
    <article
      className="p-5 rounded-2xl border border-emerald-900/10 bg-white shadow-sm space-y-4"
      aria-label={`Bài đăng bởi ${post.user.name}`}
    >
      <div className="flex items-start gap-4">
        <img
          src={post.user.avatar}
          alt={post.user.name}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-900/10"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-emerald-900/90">
              {post.user.name}
            </p>
            <span className="px-2 py-0.5 rounded-full bg-emerald-900/5 text-[10px] font-medium text-emerald-900/70">
              {post.tag}
            </span>
            <time
              className="text-[10px] uppercase tracking-wide text-emerald-800/50"
              dateTime={post.createdAt}
            >
              {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })}
            </time>
          </div>
          <p className="mt-2 text-sm text-emerald-900/80 whitespace-pre-line leading-relaxed line-clamp-4">
            {post.content}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => onReport?.(post)}
              className="text-[11px] font-medium text-rose-600 hover:text-rose-700 focus:outline-none focus:underline"
              aria-label="Báo cáo bài viết"
            >
              Báo cáo
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
