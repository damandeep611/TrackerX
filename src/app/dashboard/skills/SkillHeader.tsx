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
import { Cpu, FolderCheck, House, MoreVertical, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SkillDropdownMenu from "./SkillDropdownMenu";

interface SkillHeaderProps {
  skillSlug: string;
  skillId: string;
}

export default function SkillHeader({ skillSlug, skillId }: SkillHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className=" dark:bg-zinc-900 border border-border flex items-center justify-between gap-6 p-3 px-6">
      <div>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="flex items-center justify-center gap-2"
              >
                {" "}
                <House size={15} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/dashboard"
                className="flex items-center justify-center gap-2"
              >
                <Cpu size={15} />
                Skills
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center justify-center gap-2">
                <FolderCheck size={15} />
                {skillSlug}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {/* Header Actions */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="pl-12 pr-6 py-2 w-80  border border-gray-200 dark:border-gray-700 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-lg"
          />
        </div>
        {/* three dots menu */}
        <div>
          <motion.button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative p-2  rounded-lg cursor-pointer ${
              isDropdownOpen
                ? "bg-zinc-300 dark:bg-zinc-800"
                : "text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <MoreVertical size={20} />
          </motion.button>
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
