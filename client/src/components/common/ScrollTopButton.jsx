import React, { useEffect, useState } from "react";

export default function ScrollTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    function onScroll() {
      setShow(window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      aria-label="Lên đầu trang"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 h-11 w-11 rounded-full bg-emerald-900 text-white shadow-lg shadow-emerald-950/40 flex items-center justify-center border border-white/15 hover:scale-105 focus:scale-105 transition focus:outline-none focus:ring-2 focus:ring-lime-400"
    >
      ↑
    </button>
  );
}
