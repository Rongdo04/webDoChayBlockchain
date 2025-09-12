/**
 * EmptyError component with 2 variants: 'empty' | 'error'
 * Props: { variant, title, message, actionLabel, onAction }
 * Story:
 *  <EmptyError variant="empty" title="No Results" message="Try adjusting filters" />
 *  <EmptyError variant="error" title="Error" message="Something went wrong" actionLabel="Retry" onAction={()=>{}} />
 */
import React from "react";

const variantStyle = {
  empty: "from-emerald-950 via-emerald-900 to-lime-900",
  error: "from-rose-700 via-rose-600 to-red-500",
};

export default function EmptyError({
  variant = "empty",
  title,
  message,
  actionLabel,
  onAction,
}) {
  return (
    <div className="text-center py-14 px-4">
      <div
        className={`mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br ${variantStyle[variant]} flex items-center justify-center text-lime-200 shadow-brand`}
      >
        {variant === "empty" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M3 16.5l2.4-8.4a2.25 2.25 0 012.175-1.65h8.85a2.25 2.25 0 012.175 1.65L21 16.5M3 16.5h18M9 10.5h.008v.008H9v-.008zM15 10.5h.008v.008H15v-.008z"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m0 3.75h.007v.008H12v-.008z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      {title && (
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">{title}</h3>
      )}
      {message && (
        <p className="text-sm text-emerald-800/80 max-w-md mx-auto mb-6">
          {message}
        </p>
      )}
      {actionLabel && (
        <button onClick={() => onAction && onAction()} className="btn-brand">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
