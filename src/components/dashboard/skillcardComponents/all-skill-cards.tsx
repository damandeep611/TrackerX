"use client";
import { Skill } from "@/types/skillDashboardTypes";
import SkillCard from "./skill-card";
import DashboardHeader from "../header/DashboardHeader";
import OverviewCards from "../analytics-components/OverviewCards";
import InsightsCards from "../analytics-components/InsightsCards";
import { useAddSkillCard, useSkillCards } from "@/hooks/useSkillCardsHook";
import { toast } from "react-hot-toast";

import BouncingBarsLoader from "@/components/ui/BouncingBars";
import AddSkillModal from "./add-skill-modal";
import { LayoutGrid, ListIcon } from "lucide-react";

export default function SkillDashboard() {
  const { data: skills = [], isLoading, error } = useSkillCards();
  const addSkillMutation = useAddSkillCard();

  const handleAddSkill = async (
    newSkill: Omit<Skill, "id" | "currentHours" | "slug" | "createdAt">
  ) => {
    const skillToAdd = {
      skillName: newSkill.skillName,
      category: newSkill.category,
      targetHours: newSkill.targetHours,
      skillColor: newSkill.skillColor,
      description: newSkill.description || undefined,
    };

    try {
      await toast.promise(addSkillMutation.mutateAsync(skillToAdd), {
        loading: "Adding skill...",
        success: `${skillToAdd.skillName} added successfully!`,
        error: "Failed to add skill. Please try again.",
      });
    } catch (error) {
      console.error("Failed to add skill:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="dark:bg-zinc-950 min-h-screen flex flex-col items-center justify-center space-y-4 p-4  border border-gray-300 dark:border-gray-800 rounded-2xl">
        <BouncingBarsLoader />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
          Fetching skill data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark:bg-zinc-950 p-4 m-3 border border-gray-300 dark:border-gray-800 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading skills: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" p-4 ">
      <DashboardHeader />
      <OverviewCards />
      <InsightsCards />
      <div>
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Active Projects
          </h2>
          <div className="flex items-center gap-3">
            <AddSkillModal onAddSkill={handleAddSkill} />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
            {/* View Toggle */}
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
              <button
                className={`p-1.5 rounded-md transition-all text-gray-900 dark:text-white shadow-sm`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                className={`p-1.5 rounded-md transition-all   text-gray-900 dark:text-white shadow-sm`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}