"use client";
import AddSkillModal from "@/components/dashboard/skillcomponents/add-skill-modal";
import { Button } from "@/components/ui/button";
import { Skill } from "@/types/skillDashboardTypes";
import { useState } from "react";
import SkillCard from "./skill-card";

export default function SkillDashboard() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isSkillmodalOpen, setIsSkillmodalOpen] = useState(false);

  const handleAddSkill = (newSkill: Omit<Skill, "id" | "currentHours">) => {
    const skill: Skill = {
      ...newSkill,
      id: Math.random().toString(36).substr(2, 9),
      currentHours: 0,
    };
    setSkills((prev) => [...prev, skill]);
  };

  const handleEditSkill = (updatedSkill: Skill) => {
    setSkills((prev) =>
      prev.map((skill) => (skill.id === updatedSkill.id ? updatedSkill : skill))
    );
  };

  const handleDeleteSkill = (id: string) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };
  return (
    <div>
      {/* dashboard header and title */}
      <div className=" border-b border-gray-500 py-2">
        <h2 className="text-center text-lg font-semibold">Skill Dashboard</h2>
      </div>
      {/* dashboard form modal buttons */}
      <div className="p-2 flex items-end justify-end">
        <Button onClick={() => setIsSkillmodalOpen(true)}>Add Skill</Button>
      </div>
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
      <AddSkillModal
        isOpen={isSkillmodalOpen}
        onClose={() => setIsSkillmodalOpen(false)}
        onAddSkill={handleAddSkill}
      />
    </div>
  );
}
