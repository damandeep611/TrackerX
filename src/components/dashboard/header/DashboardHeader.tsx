"use client";
import { ChartNoAxesCombined, Command, Search } from "lucide-react";
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
    <div className=" mb-2 ">
      {/* header container */}
      <div className="flex items-center justify-between px-2  ">
        <div className="flex items-center justify-between gap-6 ">
          <ChartNoAxesCombined />
          <h3 className="text-2xl font-bold">Dashboard</h3>
        </div>
        {/* right header content */}
        <div className="flex items-center justify-between space-x-16">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-300" />
            <input
              type="text"
              placeholder="Search Anything.."
              className="pl-10 pr-4 py-2  rounded-lg  border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent w-64"
            />
            <Command className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600 dark:text-gray-300" />
          </div>
          <AddSkillModal onAddSkill={onAddSkill} />
        </div>
      </div>
    </div>
  );
}

