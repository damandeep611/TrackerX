"use client";
import { Search } from "lucide-react";
import React from "react";
import AddSkillModal from "../skillcardComponents/add-skill-modal";
import { Skill } from "@/types/skillDashboardTypes";

interface DashboardHeaderProps {
  onAddSkill: (
    skill: Omit<Skill, "id" | "currentHours" | "slug" | "createdAt">
  ) => void;
}

export default function DashboardHeader({ onAddSkill }: DashboardHeaderProps) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 mb-2 ">
      {/* header container */}
      <div className="flex items-center justify-between px-6 py-2 ">
        <div className="flex items-center justify-between gap-6 ">
          <div>
            <h3 className="text-2xl font-bold">Skills Overview</h3>
            <span className="text-sm font-medium text-gray-500">
              Track your learning
            </span>
          </div>
        </div>
        {/* right header content */}
        <div className="flex items-center justify-between space-x-16">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search skills..."
              className="pl-10 pr-4 py-2  rounded-lg text-sm border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent w-64"
            />
          </div>
          <AddSkillModal onAddSkill={onAddSkill} />
        </div>
      </div>
    </div>
  );
}
