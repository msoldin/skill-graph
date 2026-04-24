import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f0ede8",
        surface: "#ffffff",
        panel: "#faf9f7",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
