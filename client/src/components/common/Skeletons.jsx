import React from "react";

export function RecipeCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white border border-emerald-100 p-0 animate-pulse">
      <div className="aspect-[4/3] bg-emerald-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-emerald-100 rounded w-3/4" />
        <div className="h-3 bg-emerald-100 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-4 bg-emerald-100 rounded w-10" />
          <div className="h-4 bg-emerald-100 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export function VideoSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden border border-emerald-200 bg-white animate-pulse">
      <div className="grid md:grid-cols-2">
        <div className="h-64 md:h-full bg-emerald-100" />
        <div className="p-8 space-y-4">
          <div className="h-6 bg-emerald-100 rounded w-1/2" />
          <div className="h-4 bg-emerald-100 rounded w-3/4" />
          <div className="h-4 bg-emerald-100 rounded w-2/3" />
          <div className="flex gap-3 pt-4">
            <div className="h-10 w-32 rounded-xl bg-emerald-100" />
            <div className="h-10 w-28 rounded-xl bg-emerald-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
