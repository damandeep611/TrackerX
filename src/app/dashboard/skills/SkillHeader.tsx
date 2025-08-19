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
import { Cpu, Ellipsis, FolderCheck, House } from "lucide-react";
import { PiShareFat } from "react-icons/pi";

import { AnimatePresence, motion } from "framer-motion";
import SkillDropdownMenu from "./SkillDropdownMenu";

interface SkillHeaderProps {
  skillSlug: string;
  skillId: string;
}

export default function SkillHeader({ skillSlug, skillId }: SkillHeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className=" bg-[#F5F5F5] dark:bg-zinc-950  flex items-center justify-between gap-6 p-3 px-6">
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
        <div>
          <PiShareFat size={20} />
        </div>
        {/* three dots menu */}
        <div>
          <motion.button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`relative p-2 flex items-center justify-between gap-2 rounded-full cursor-pointer border border-zinc-300 dark:border-zinc-500 ${
              isDropdownOpen
                ? "bg-zinc-300 dark:bg-zinc-800"
                : "text-zinc-700 dark:text-zinc-400"
            }`}
          >
            <Ellipsis size={20} />
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
