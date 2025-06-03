"use client";
import { Button } from "@/components/ui/button";
import { Skill } from "@/types/skillDashboardTypes";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X } from "lucide-react";

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
    setIsOpen(false); // Close the form after submission
  };

  return (
    <>
      {/* Floating action button */}
      <motion.button
        onClick={openDrawer}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </motion.button>

      {/* Modal overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={openDrawer}
        />
      )}

      {/* Modal form */}
      <motion.div
        className="fixed left-1/2 -translate-x-1/2 bottom-0 z-50 w-full max-w-md bg-white dark:bg-black rounded-t-3xl shadow-lg border border-gray-500"
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          {/* Modal header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Add New Skill</h2>
            <button
              onClick={openDrawer}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Skill form */}
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
              {/* skill target hours */}
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
              {/* skill color */}
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
                  className="block mt-1 w-full h-10 rounded-md border border-gray-400"
                />
              </div>
              {/* form buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant={"default"} type="submit">
                  Add Skill
                </Button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </>
  );
}
