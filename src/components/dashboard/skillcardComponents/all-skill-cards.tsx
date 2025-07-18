"use client";
import { Skill } from "@/types/skillDashboardTypes";
import SkillCard from "./skill-card";
import DashboardHeader from "../header/DashboardHeader";
import OverviewCards from "../analytics-components/OverviewCards";
import InsightsCards from "../analytics-components/InsightsCards";
import { useAddSkillCard, useSkillCards } from "@/hooks/useSkillCardsHook";

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
      await addSkillMutation.mutateAsync(skillToAdd);
    } catch (error) {
      console.error("Failed to add skill:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="dark:bg-zinc-950 p-2">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
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
        <div>
          <h2 className="text-xl font-semibold">Your Skills / Projects</h2>
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