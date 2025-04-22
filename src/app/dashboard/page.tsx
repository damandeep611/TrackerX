"use client";
import AddSkillModal from "@/components/dashboard/skillcomponents/add-skill-modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DashboardPage() {
  const [isSkillmodalOpen, setIsSkillmodalOpen] = useState(false);
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
      <AddSkillModal
        isOpen={isSkillmodalOpen}
        onClose={() => setIsSkillmodalOpen(false)}
      />
    </div>
  );
}
