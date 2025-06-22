"use client";
import { authClient } from "@/lib/auth-client";
import { Search } from "lucide-react";
import React from "react";
import UserProfile from "../sidebar/user-profile";
import AddSkillModal from "../skillcardComponents/add-skill-modal";
import { Skill } from "@/types/skillDashboardTypes";

interface DashboardHeaderProps {
  onAddSkill: (skill: Omit<Skill, "id" | "currentHours" | "slug">) => void;
}

export default function DashboardHeader({ onAddSkill }: DashboardHeaderProps) {
  const { data } = authClient.useSession();
  return (
    <div className="border-b border-border bg-primary-foreground">
      {/* header container */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center justify-between gap-6 ">
          <div>
            <h3 className="text-2xl font-bold">Skills Overview</h3>
            <span className="text-sm font-medium text-gray-500">
              Track your learning journey and master new skills
            </span>
          </div>
          <div className=" hidden  md:flex items-center space-x-2 border border-border p-2 rounded-md ">
            <input
              type="text"
              placeholder="Search Skills.."
              className="bg-transparent text-sm w-32 "
            />
            <span className=" text-gray-400">
              <Search />
            </span>
          </div>
        </div>
        {/* right header content */}
        <div className="flex items-center justify-between space-x-16">
          <AddSkillModal onAddSkill={onAddSkill} />
          <div>
            <UserProfile
              name={data?.user.name || ""}
              email={data?.user.email || ""}
              avatarUrl={data?.user.image || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
