import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Pretendard", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        canvas: "#08090a",
        panel: "#0f1011",
        surface: "#191a1b",
        line: "rgba(255,255,255,0.08)",
        muted: "#8a8f98",
        text: "#f7f8f8",
        accent: "#7170ff",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
