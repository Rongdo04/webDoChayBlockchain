import React, { useMemo } from "react";
import FeedItem from "./FeedItem.jsx";

export default function FeedList({ posts, filterTag, onReport }) {
  const list = useMemo(
    () =>
      filterTag && filterTag !== "Tất cả"
        ? posts.filter((p) => p.tag === filterTag)
        : posts,
    [posts, filterTag]
  );

  if (!list.length)
    return (
      <p className="text-xs text-emerald-800/60 px-2">Không có bài phù hợp.</p>
    );

  return (
    <div className="space-y-4">
      {list.map((p) => (
        <FeedItem key={p.id} post={p} onReport={onReport} />
      ))}
    </div>
  );
}
