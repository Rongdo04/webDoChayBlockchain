/**
 * DataTable Component
 * Props:
 *  - columns: [{ id, header, accessor?: (row)=>any, cell?: (value,row)=>ReactNode, sortable?: bool }]
 *  - rows: [{ id, ...data }]
 *  - selectable: boolean
 *  - onBulkAction?: (selectedIds)=>void
 *  - sort: { id: string|null, direction: 'asc'|'desc'|null }
 *  - onSortChange?: ({ id, direction }) => void
 *  - emptyMessage?: string
 *  - loading?: boolean
 *
 * Story (demo):
 *  const cols = [
 *    { id: 'title', header: 'Title', sortable: true },
 *    { id: 'status', header: 'Status', cell: (v)=> <StatusPill status={v}/> },
 *    { id: 'author', header: 'Author', sortable: true },
 *  ];
 *  <DataTable
 *    columns={cols}
 *    rows={recipes}
 *    selectable
 *    sort={sort}
 *    onSortChange={setSort}
 *    onBulkAction={(ids)=> console.log('Bulk delete', ids)}
 *  />
 */
import React, { useState, useEffect } from "react";
import { t } from "../../i18n";
import StatusPill from "./StatusPill.jsx";

function SortIndicator({ active, direction }) {
  return (
    <span
      aria-hidden="true"
      className={`ml-1 inline-block w-3 h-3 text-[10px] ${
        active ? "opacity-100" : "opacity-30"
      }`}
    >
      {direction === "asc" && "▲"}
      {direction === "desc" && "▼"}
      {!direction && "↕"}
    </span>
  );
}

export default function DataTable({
  columns = [],
  rows = [],
  selectable = false,
  onBulkAction,
  sort = { id: null, direction: null },
  onSortChange,
  emptyMessage = t("table.empty", "No data"),
  loading = false,
}) {
  const [selected, setSelected] = useState([]);

  // Reset selection if rows change
  useEffect(() => {
    setSelected([]);
  }, [rows]);

  const allChecked =
    selectable && rows.length > 0 && selected.length === rows.length;
  const indeterminate =
    selectable && selected.length > 0 && selected.length < rows.length;

  const toggleAll = () => {
    if (allChecked || indeterminate) setSelected([]);
    else setSelected(rows.map((r) => r.id || r._id));
  };

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleHeaderClick = (col) => {
    if (!col.sortable) return;
    let direction = "asc";
    if (sort.id === col.id) {
      if (sort.direction === "asc") direction = "desc";
      else if (sort.direction === "desc") direction = null; // cycle to unsorted
      else direction = "asc";
    }
    const payload = { id: direction ? col.id : null, direction };
    onSortChange && onSortChange(payload);
  };

  return (
    <div
      className="border border-emerald-900/15 rounded-xl overflow-hidden bg-white shadow-sm"
      role="table"
      aria-rowcount={rows.length}
    >
      {selectable && selected.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border-b border-emerald-900/10 text-sm">
          <span className="font-medium text-emerald-900">
            {selected.length} {t("table.selected", "selected")}
          </span>
          {onBulkAction && (
            <button
              className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 text-white text-xs font-medium shadow-brand focus:outline-none focus:ring-2 focus:ring-lime-400"
              onClick={() => onBulkAction(selected)}
            >
              {t("table.bulkAction", "Bulk Action")}
            </button>
          )}
          <button
            className="ml-auto text-xs text-emerald-700 hover:underline"
            onClick={() => setSelected([])}
          >
            {t("table.clear", "Clear")}
          </button>
        </div>
      )}
      <div className="overflow-auto" role="rowgroup">
        <table className="w-full text-sm">
          <thead className="bg-emerald-950/90 text-emerald-50 text-left">
            <tr role="row">
              {selectable && (
                <th scope="col" className="px-3 py-2 w-8 align-middle">
                  <input
                    type="checkbox"
                    aria-label={t("common.selectAll", "Select all rows")}
                    checked={allChecked}
                    ref={(el) => {
                      if (el) el.indeterminate = indeterminate;
                    }}
                    onChange={toggleAll}
                    className="accent-lime-400 cursor-pointer"
                  />
                </th>
              )}
              {columns.map((col) => {
                const active = sort.id === col.id;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={`px-4 py-2 font-semibold text-xs uppercase tracking-wide select-none ${
                      col.sortable
                        ? "cursor-pointer hover:bg-emerald-900/40"
                        : ""
                    }`}
                    onClick={() => handleHeaderClick(col)}
                    aria-sort={
                      active
                        ? sort.direction === "asc"
                          ? "ascending"
                          : sort.direction === "desc"
                          ? "descending"
                          : "none"
                        : "none"
                    }
                  >
                    <span className="inline-flex items-center">
                      {col.header}
                      {col.sortable && (
                        <SortIndicator
                          active={active}
                          direction={active ? sort.direction : null}
                        />
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-6 text-center text-emerald-700 text-sm"
                >
                  {t("table.loading", "Loading...")}
                </td>
              </tr>
            )}
            {!loading && rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-8 text-center text-emerald-800/70 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((row) => {
                const rowId = row.id || row._id;
                return (
                  <tr
                    key={rowId}
                    className="border-b last:border-b-0 border-emerald-900/10 hover:bg-emerald-50/60 focus-within:bg-emerald-50/80"
                    role="row"
                  >
                    {selectable && (
                      <td className="px-3 py-2 align-middle">
                        <input
                          type="checkbox"
                          aria-label={`Select row ${rowId}`}
                          checked={selected.includes(rowId)}
                          onChange={() => toggleOne(rowId)}
                          className="accent-lime-400 cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map((col) => {
                      const raw = col.accessor
                        ? col.accessor(row)
                        : row[col.id];
                      const content = col.cell ? col.cell(raw, row) : raw;
                      return (
                        <td
                          key={col.id}
                          className="px-4 py-2 align-middle text-emerald-900/90 text-sm"
                          role="cell"
                        >
                          {content}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
