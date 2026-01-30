"use client";
import React, { useState } from "react";
import { FolderCheck, MoreHorizontal, Share2 } from "lucide-react";

import { AnimatePresence } from "framer-motion";
import SkillDropdownMenu from "./SkillDropdownMenu";

interface SkillHeaderProps {
  skillSlug: string;
  skillId: string;
  skillName: string;
  createdAt: Date | null;
  activeTab: "workflow" | "analytics";
  onTabChange: (tab: "workflow" | "analytics") => void;
}

export default function SkillHeader({
  skillSlug,
  skillId,
  skillName,
  createdAt,
  activeTab,
  onTabChange,
}: SkillHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className="flex items-center justify-between gap-6 p-3 px-6 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-50">
        <div className="p-2 bg-surfaceHighlight rounded-lg border border-border">
          <FolderCheck size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
            {skillName}
          </h1>
          {createdAt && (
            <p className="text-[10px] text-zinc-500" suppressHydrationWarning>
              Created {createdAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Tabs - Middle Section */}
      <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
        <button
          onClick={() => onTabChange("workflow")}
          className={`px-6 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === "workflow"
              ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Workflow
        </button>
        <button
          onClick={() => onTabChange("analytics")}
          className={`px-6 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeTab === "analytics"
              ? "bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Header Actions */}
      <div className="flex items-center space-x-4 min-w-50 justify-end">
        <button className="p-2 hover:bg-surfaceHighlight rounded-md text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-border">
          <Share2 size={18} />
        </button>
        {/* three dots menu */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`p-2 rounded-md transition-colors border ${
              isDropdownOpen
                ? "bg-surfaceHighlight text-white border-border"
                : "text-zinc-400 hover:text-white hover:bg-surfaceHighlight border-transparent hover:border-border"
            }`}
          >
            <MoreHorizontal size={18} />
          </button>
          {/* dropdown skill menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <>
                <SkillDropdownMenu skillId={skillId} />
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
