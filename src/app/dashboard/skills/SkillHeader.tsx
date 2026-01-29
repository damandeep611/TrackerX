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
}

export default function SkillHeader({
  skillSlug,
  skillId,
  skillName,
  createdAt,
}: SkillHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className="   flex items-center justify-between gap-6 p-3 px-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-surfaceHighlight rounded-lg border border-border">
          <FolderCheck size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-white">
            {skillName}
          </h1>
          {createdAt && (
            <p className="text-[10px] text-zinc-500">
              Created {createdAt.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 hover:bg-surfaceHighlight rounded-md text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-border">
          <Share2 size={18} />
        </button>
        {/* three dots menu */}
        <div>
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
