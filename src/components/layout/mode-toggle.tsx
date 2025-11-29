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
        className="w-full flex items-center justify-between cursor-pointer px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          {resolvedTheme ? (
            <Sun className="w-4 h-4 text-gray-400" />
          ) : (
            <Moon className="w-4 h-4 text-gray-400" />
          )}
          <span>Theme</span>
        </div>
        <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
          {resolvedTheme ? "Dark" : "Light"}
        </span>
      </button>
    </div>
  );
}

