"use client";
import { Flag, HelpCircle, Search, Settings } from "lucide-react";
import React from "react";

export default function DashboardHeader() {
  return (
    <div className="h-16 flex items-center justify-between px-8  shrink-0 z-20">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Quick search here..."
          className="w-full pl-10 pr-12 py-2 bg-white dark:bg-gray-800 border border-transparent focus:border-gray-300 dark:focus:border-gray-600 rounded-lg text-sm shadow-sm focus:outline-none focus:ring-0 placeholder:text-gray-400 dark:text-white dark:placeholder-gray-500 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400 font-medium border border-gray-200 dark:border-gray-600">
          /
        </div>
      </div>

      {/* Right Utilities */}
      <div className="flex items-center gap-6">
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <Flag className="w-4 h-4" />
          Report
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <Settings className="w-4 h-4" />
          Tools
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
          <HelpCircle className="w-4 h-4" />
          Help
        </button>
      </div>
    </div>
  );
}

