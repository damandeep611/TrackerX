"use client";
import { Button } from "@/components/ui/button";
import { Skill } from "@/types/skillDashboardTypes";
import React, { useState } from "react";
import { motion } from "framer-motion";

interface AddSkillModalProps {
  onAddSkill: (skill: Omit<Skill, "id" | "currentHours" | "slug">) => void;
}

export default function AddSkillModal({ onAddSkill }: AddSkillModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    skillName: "",
    category: "",
    targetHours: 10000,
    skillColor: "#6366f1",
  });
  const openDrawer = () => {
    setIsOpen(!isOpen);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSkill(formData);
  };

  return (
    <>
      {/* button to open side panel */}
      <motion.button
        onClick={openDrawer}
        animate={{ x: isOpen ? -320 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-20 z-40 flex h-12 w-8 items-center justify-center rounded-l-md bg-indigo-600 text-white shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          )}
        </svg>
      </motion.button>
      {/* drawer  */}
      <motion.div
        className="fixed right-0 top-0 z-30 h-full w-80 shadow-lg border-l border-gray-500"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="py-12">
          {/* modal header and closer */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Add New Skill</h2>
          </div>
          <div className="p-2 border border-gray-400">
            {/* skill form */}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* skill name */}
                <div>
                  <label
                    htmlFor="skillName"
                    className="block text-sm font-medium"
                  >
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
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium"
                  >
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
                  <label
                    htmlFor="skillColor"
                    className="block text-sm font-medium"
                  >
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
                  <Button variant={"outline"}>Cancel</Button>
                  <Button variant={"default"} type="submit">
                    Add Skill
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  );
}
