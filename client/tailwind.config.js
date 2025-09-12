/** @type {import('tailwindcss').Config} */
export default {
  // Limit content scanning strictly to src per requirement
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          from: "#022c22",
          via: "#064e3b",
          to: "#365314",
          solid: "#064e3b",
          ring: "#a3e635",
        },
      },
      boxShadow: {
        brand: "0 8px 24px -8px rgba(163, 230, 53, 0.25)",
      },
      fontSize: {
        h1: ["32px", { lineHeight: "40px", fontWeight: "700" }],
        h2: ["24px", { lineHeight: "32px", fontWeight: "600" }],
        h3: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        base: ["16px", { lineHeight: "24px" }],
        caption: ["12px", { lineHeight: "18px" }],
      },
      borderRadius: {
        mdx: "10px",
        lgx: "16px",
        "2xlx": "24px",
      },
    },
  },
  plugins: [],
};
