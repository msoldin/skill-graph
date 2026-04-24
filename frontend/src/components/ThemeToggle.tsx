"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: only render icon after client mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Render a same-size invisible placeholder to avoid layout shift
    return <div className="w-8 h-8" aria-hidden />;
  }

  return (
    <button
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
    >
      {resolvedTheme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
