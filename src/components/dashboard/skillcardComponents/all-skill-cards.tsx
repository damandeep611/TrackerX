"use client";
import { Skill } from "@/types/skillDashboardTypes";
import SkillCard from "./skill-card";
import DashboardHeader from "../header/DashboardHeader";
import OverviewCards from "../analytics-components/OverviewCards";
import InsightsCards from "../analytics-components/InsightsCards";
import { useAddSkillCard, useSkillCards } from "@/hooks/useSkillCardsHook";
import { toast } from "react-hot-toast";

import BouncingBarsLoader from "@/components/ui/BouncingBars";

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
      <div className="dark:bg-zinc-950 min-h-screen flex flex-col items-center justify-center space-y-4">
        <BouncingBarsLoader />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
          Fetching skill data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark:bg-zinc-950 p-2">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading skills: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-zinc-950 p-2">
      <DashboardHeader onAddSkill={handleAddSkill} />
      <div className="p-4">
        <h3 className="text-xl font-bold">Your progress</h3>
        <p className="text-sm dark:text-zinc-400 font-semibold">
          Learning Patterns and Productivity Insights
        </p>
      </div>
      <OverviewCards />
      <InsightsCards />

      <div className="p-4 my-2">
        <div className="mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-200 mb-2">
            Project Dashboard
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Track progress across all your active projects
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}