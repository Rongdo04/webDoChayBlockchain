/**
 * SearchInput
 * Props: value, onChange(value), onSubmit(value)
 * Story:
 *  <SearchInput value={query} onChange={setQuery} onSubmit={(q)=>console.log(q)} />
 */
import React, { useState, useEffect } from "react";
import { t } from "../../i18n";

export default function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = t("common.search", "Tìm kiếm") + "...",
  delay = 0,
}) {
  const [internal, setInternal] = useState(value || "");

  useEffect(() => {
    setInternal(value || "");
  }, [value]);

  // Optional debounce
  useEffect(() => {
    if (!delay) return;
    const t = setTimeout(() => {
      onChange && onChange(internal);
    }, delay);
    return () => clearTimeout(t);
  }, [internal, delay, onChange]);

  const handleChange = (e) => {
    setInternal(e.target.value);
    if (!delay) onChange && onChange(e.target.value);
  };

  const submit = (e) => {
    e && e.preventDefault();
    onSubmit && onSubmit(internal);
  };

  return (
    <form
      onSubmit={submit}
      className="relative group"
      role="search"
      aria-label={t("common.search", "Search")}
    >
      <input
        type="search"
        value={internal}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label={t("common.search", "Search")}
        className="w-full rounded-xl pl-10 pr-3 py-2 text-sm bg-white border border-emerald-900/15 shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
      />
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/70 pointer-events-none"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </span>
    </form>
  );
}
