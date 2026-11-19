"use client";

import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? theme === "dark" : true;

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-full border transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#DC2626]/40 cursor-pointer ${
        isDark
          ? "bg-white/[0.06] hover:bg-white/[0.12] border-white/15 text-amber-400 hover:text-amber-300 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
          : "bg-black/[0.04] hover:bg-black/[0.08] border-black/10 text-slate-700 hover:text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
