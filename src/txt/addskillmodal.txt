"use client";
import { Button } from "@/components/ui/button";
import { Skill } from "@/types/skillDashboardTypes";
import { XIcon } from "lucide-react";
import React, { useState } from "react";

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSkill: (skill: Omit<Skill, "id" | "currentHours" | "slug">) => void;
}

export default function AddSkillModal({
  isOpen,
  onClose,
  onAddSkill,
}: AddSkillModalProps) {
  const [formData, setFormData] = useState({
    skillName: "",
    category: "",
    targetHours: 10000,
    skillColor: "#6366f1",

  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSkill(formData);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs  flex items-center justify-center z-50 ">
      <div className="max-w-md w-full rounded-lg p-6 border border-gray-400 bg-white dark:bg-black">
        {/* modal header and closer */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add New Skill</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <XIcon />
          </button>
        </div>
        {/* skill form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* skill name */}
            <div>
              <label htmlFor="skillName" className="block text-sm font-medium">
                Skill Name
              </label>
              <input
                type="text"
                id="skillName"
                value={formData.skillName}
                onChange={(e) =>
                  setFormData({ ...formData, skillName: e.target.value })
                }
                placeholder="Enter Skill Name"
                className="mt-1 block w-full rounded-md border border-gray-400 px-3 py-2"
              />
            </div>
            {/* skill category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium">
                Category
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="Enter Skill Category"
                className="mt-1 block w-full rounded-md border border-gray-400 px-3 py-2"
              />
            </div>
            {/* skill target hours to be set */}
            <div>
              <label
                htmlFor="targetHours"
                className="block text-sm font-medium"
              >
                Target Hours
              </label>
              <input
                type="number"
                id="targetHours"
                value={formData.targetHours}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetHours: Number(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border border-gray-400 px-3 py-2"
              />
            </div>
            {/* skill color check */}
            <div>
              <label htmlFor="skillColor" className="block text-sm font-medium">
                Skill Color
              </label>
              <input
                type="color"
                id="skillColor"
                value={formData.skillColor}
                onChange={(e) =>
                  setFormData({ ...formData, skillColor: e.target.value })
                }
                className="block mt-1 w-full h-10 rounded-md border border-gray-400 "
              />
            </div>
            {/* form buttons */}
            <div className="mt-3 flex justify-end space-x-3">
              <Button variant={"outline"} onClick={onClose}>
                Cancel
              </Button>
              <Button variant={"default"} type="submit">
                Add Skill
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
