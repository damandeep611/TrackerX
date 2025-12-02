"use client";
import React, { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Cpu, FolderCheck, House, MoreHorizontal, Share2 } from "lucide-react";

import { AnimatePresence } from "framer-motion";
import SkillDropdownMenu from "./SkillDropdownMenu";

interface SkillHeaderProps {
  skillSlug: string;
  skillId: string;
}

export default function SkillHeader({ skillSlug, skillId }: SkillHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className="   flex items-center justify-between gap-6 p-3 px-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="flex items-center justify-center gap-2 text-xs"
              >
                {" "}
                <House size={12} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="flex items-center justify-center gap-2 text-xs"
              >
                <Cpu size={12} />
                Skills
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center justify-center gap-2 text-sm">
                <FolderCheck size={12} />
                {skillSlug}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
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
