"use client";
import { Skill } from "@/types/skillDashboardTypes";
import { useState } from "react";
import SkillCard from "./skill-card";
import { v4 as uuidv4 } from "uuid";
import { addSkillCard } from "@/actions/skillCardAction";
import DashboardHeader from "../header/DashboardHeader";
import OverviewCards from "../analytics-components/OverviewCards";
import InsightsCards from "../analytics-components/InsightsCards";

interface skillcardProps {
  skillcards: Skill[];
}

export default function SkillDashboard({ skillcards }: skillcardProps) {
  const [skills, setSkills] = useState<Skill[]>(skillcards);

  const handleAddSkill = async (
    newSkill: Omit<Skill, "id" | "currentHours" | "slug" | "createdAt">
  ) => {
    const now = new Date().toISOString();
    const skillToAdd = {
      skillName: newSkill.skillName,
      category: newSkill.category,
      targetHours: newSkill.targetHours,
      skillColor: newSkill.skillColor,
      description: newSkill.description || undefined,
    };

    const skill: Skill = {
      ...newSkill,
      id: uuidv4(),
      currentHours: 0,
      createdAt: now,
      description: newSkill.description || null,
      slug: newSkill.skillName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    };
    await addSkillCard(skillToAdd);
    setSkills((prev) => [...prev, skill]);
  };

  const handleEditSkill = (updatedSkill: Skill) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill))
    );
  };

  // const handleDeleteSkill = (id: string) => {
  //   setSkills((prev) => prev.filter((skill) => skill.id !== id));
  //   deleteSkillCard(id);
  // };
  return (
    <div className="dark:bg-zinc-950 p-2">
      {/* dashboard header and title */}
      <DashboardHeader onAddSkill={handleAddSkill} />
      <div className="p-4">
        <h3 className="text-xl font-bold">Your progress</h3>
        <p className="text-sm dark:text-zinc-400 font-semibold">
          Learning Patterns and Productivity Insights
        </p>
      </div>
      <OverviewCards />
      <InsightsCards />
      {/* skill cards adding to dashbaord */}
      <div className="p-4 my-2">
        <div>
          <h2 className="text-xl font-semibold">Your Skills / Projects</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onEdit={handleEditSkill} />
        ))}
      </div>
    </div>
  );
}
