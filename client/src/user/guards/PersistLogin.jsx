import React, { useEffect, useState, useRef } from "react";
import { useAuthAdapter } from "../../auth/useAuthAdapter.js";

export default function PersistLogin({ children }) {
  const { refresh, loading } = useAuthAdapter();
  const [init, setInit] = useState(false);

  const attemptedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (attemptedRef.current) {
        setInit(true);
        return;
      }
      attemptedRef.current = true;
      try {
        await refresh();
      } finally {
        if (mounted) setInit(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refresh]);

  if (!init || loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-lime-50 to-white text-center p-8"
        role="status"
        aria-live="polite"
      >
        <div
          className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mb-6"
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-emerald-800">Đang xác thực…</p>
      </div>
    );
  }
  return children;
}
