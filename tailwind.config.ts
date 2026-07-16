import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0a",
        surface: "#121211",
        elevated: "#181816",
        line: "#2a2925",
        solana: {
          cyan: "#4ea7b2",
          green: "#78b892",
          purple: "#8d7ad9"
        }
      },
      fontFamily: {
        sans: ["Inter", "Geist", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
      },
      boxShadow: {
        panel: "0 16px 60px rgba(0,0,0,0.32)"
      }
    }
  },
  plugins: []
};

export default config;
