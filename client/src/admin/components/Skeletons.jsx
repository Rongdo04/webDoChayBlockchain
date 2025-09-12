/**
 * Skeletons
 * Exports: TableSkeleton, CardSkeletonGrid
 * Story:
 *  <TableSkeleton rows={5} cols={4} />
 *  <CardSkeletonGrid count={6} />
 */
import React from "react";

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="border border-emerald-900/15 rounded-xl overflow-hidden bg-white">
      <div className="h-10 bg-emerald-900/10" />
      <ul className="divide-y divide-emerald-900/10">
        {Array.from({ length: rows }).map((_, i) => (
          <li
            key={i}
            className="grid"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((__, j) => (
              <div key={j} className="p-3">
                <div className="h-4 w-3/4 skeleton" />
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-emerald-900/10 p-4 bg-white space-y-3"
        >
          <div className="h-32 skeleton rounded-lg" />
          <div className="h-4 w-2/3 skeleton" />
          <div className="h-3 w-1/2 skeleton" />
          <div className="flex gap-2">
            <div className="h-6 w-14 skeleton rounded-full" />
            <div className="h-6 w-20 skeleton rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default { TableSkeleton, CardSkeletonGrid };
