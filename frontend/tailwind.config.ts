import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: "#f0ede8",
          dark: "#0c0a09",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark: "#292524",
        },
        panel: {
          DEFAULT: "#faf9f7",
          dark: "#1c1917",
        },
      },
    },
  },
  plugins: [typography],
} satisfies Config;
