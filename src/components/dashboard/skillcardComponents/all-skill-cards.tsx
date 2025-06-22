"use client";
import { Skill } from "@/types/skillDashboardTypes";
import { useState } from "react";
import SkillCard from "./skill-card";
import { v4 as uuidv4 } from "uuid";
import { addSkillCard, deleteSkillCard } from "@/actions/skillCardAction";
import DashboardHeader from "../header/DashboardHeader";

interface skillcardProps {
  skillcards: Skill[];
}

export default function SkillDashboard({ skillcards }: skillcardProps) {
  const [skills, setSkills] = useState<Skill[]>(skillcards);

  const handleAddSkill = async (
    newSkill: Omit<Skill, "id" | "currentHours" | "slug">
  ) => {
    const skill: Skill = {
      ...newSkill,
      id: uuidv4(),
      currentHours: 0,
      slug: newSkill.skillName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    };
    await addSkillCard(skill);
    setSkills((prev) => [...prev, skill]);
  };

  const handleEditSkill = (updatedSkill: Skill) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill))
    );
  };

  const handleDeleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
    deleteSkillCard(id);
  };
  return (
    <div>
      {/* dashboard header and title */}
      <DashboardHeader onAddSkill={handleAddSkill} />
      {/* skill cards adding to dashbaord */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {skills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onEdit={handleEditSkill}
            onDelete={handleDeleteSkill}
          />
        ))}
      </div>
    </div>
  );
}
