import React from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import SearchHero from "../components/search/SearchHero.jsx";
import RecentKeywords from "../components/search/RecentKeywords.jsx";
import GroupedResults from "../components/search/GroupedResults.jsx";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("query") || params.get("q") || "";

  return (
    <div className="space-y-12">
      <SearchHero />
      <div className="grid lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3 space-y-12">
          {query ? (
            <GroupedResults query={query} />
          ) : (
            <div className="p-8 rounded-2xl border border-emerald-900/10 bg-white shadow-sm space-y-6 text-center">
              <p className="text-sm text-emerald-800/70">
                Nhập từ khóa để bắt đầu tìm kiếm.
              </p>
              <p className="text-xs text-emerald-800/50">Gợi ý thử:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["đậu hũ", "nấm", "salad", "bí đỏ", "bún", "gỏi"].map((k) => (
                  <span
                    key={k}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-emerald-900/5 text-emerald-900/70 border border-emerald-900/10"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <aside className="lg:col-span-1 space-y-10">
          <RecentKeywords
            onSelect={(kw) => {
              window.location.assign(`/search?q=${encodeURIComponent(kw)}`);
            }}
          />
          <div className="p-5 rounded-xl border border-emerald-900/10 bg-white shadow-sm space-y-3 text-xs text-emerald-800/70">
            <p className="font-semibold text-emerald-900/80 text-[11px] uppercase tracking-wide">
              Ghi chú
            </p>
            <p>
              Trang tìm kiếm này hiện chỉ sử dụng dữ liệu mock cục bộ để minh
              họa giao diện nhóm kết quả.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
