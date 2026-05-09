import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:        "#0B0B0F",
        "bg-2":    "#14141B",
        "bg-3":    "#1C1C25",
        text:      "#F0EFE9",
        "text-soft": "#8E8E96",
        accent:    "#D4A95A",
        "accent-2":"#E8C476",
        signal:    "#5DE0E6",
        rule:      "rgba(240,239,233,.08)",
        ink:       "#0A0908",
      },
      fontFamily: {
        serif: ["'Instrument Serif'", "Georgia", "serif"],
        sans:  ["Inter", "system-ui", "sans-serif"],
        mono:  ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(180deg, #E8C476, #D4A95A)",
      },
      maxWidth: { content: "1280px", prose: "760px" },
      boxShadow: {
        glow: "0 8px 24px rgba(212,169,90,.25)",
        "glow-strong": "0 12px 32px rgba(212,169,90,.35)",
      },
    },
  },
  plugins: [],
};
export default config;
