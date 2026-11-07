"use client";
import {
  Bell,
  Calendar,
  ChevronDown,
  RefreshCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import React from "react";
import { motion } from "motion/react";

export default function DashboardHeader() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between  bg-background/50 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none p-4  border-b border-border/50 lg:border-none">
      {/* Title Block */}
      <div>
        <motion.h1
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold tracking-tight text-primary"
        >
          Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-text-tertiary mt-1"
        >
          Overview of your activity and performance.
        </motion.p>
      </div>

      {/* Tools Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative group w-full sm:w-auto">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-text-primary transition-colors"
            size={14}
          />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full sm:w-64 rounded-lg border border-border bg-surface px-9 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-secondary focus:outline-none focus:ring-1 focus:ring-text-secondary transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-surface-highlight px-1.5 font-mono text-[10px] font-medium text-text-secondary">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {/* Date Filter */}
          <button className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary hover:bg-surface-highlight hover:text-text-primary transition-colors whitespace-nowrap">
            <Calendar size={14} />
            <span>Oct 24 - 30</span>
            <ChevronDown size={12} className="opacity-50" />
          </button>

          {/* Filter */}
          <button className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-highlight hover:text-text-primary transition-colors">
            <SlidersHorizontal size={14} />
          </button>

          {/* Notifications */}
          <button className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-text-secondary hover:bg-surface-highlight hover:text-text-primary transition-colors">
            <Bell size={14} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-surface" />
          </button>

          <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

          {/* Data Toggle */}
          <button
            className={` group flex flex-shrink-0 items-center cursor-pointer gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all whitespace-nowrap border-blue-500/20 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20
                        `}
          >
            <RefreshCw
              size={14}
              className="cursor-pointer group-hover:animate-spin"
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>
    </div>
  );
}

