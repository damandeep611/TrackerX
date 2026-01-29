"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react";

export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const toggleTheme = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return (
    <div>
      {/* new theme switcher */}
      <button
        onClick={toggleTheme}
        className="w-full flex items-center justify-between cursor-pointer px-3 py-1.5 text-xs text-text-secondary hover:text-primary hover:bg-surface-highlight rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2">
          {resolvedTheme === "dark" ? (
            <Moon className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary" />
          )}
          <span className="font-medium">Theme</span>
        </div>
        <span className="text-[10px] font-medium bg-surface dark:bg-surface-highlight border border-border px-1.5 py-0.5 rounded text-text-tertiary group-hover:text-primary group-hover:border-primary/20 transition-all">
          {resolvedTheme === "dark" ? "Dark" : "Light"}
        </span>
      </button>
    </div>
  );
}

