import { vi } from "./vi.js";
export const t = (key, fallback) => {
  const parts = key.split(".");
  let cur = vi;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
    else {
      cur = null;
      break;
    }
  }
  if (typeof cur === "string") return cur;
  return fallback || key;
};
