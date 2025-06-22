"use client";
import { Skill } from "@/types/skillDashboardTypes";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    setIsOpen(false);
  };

  return (
    <>
      {/* Clean Add Button */}
      <button
        onClick={openDrawer}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
      >
        <Plus size={16} />
        Add skill
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={openDrawer}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md"
            >
              <div className="bg-white dark:bg-gray-900 rounded-t-xl shadow-xl border-t border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Add skill
                  </h3>
                  <button
                    onClick={openDrawer}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* Skill Name */}
                    <div>
                      <label
                        htmlFor="skillName"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Name
                      </label>
                      <input
                        type="text"
                        id="skillName"
                        value={formData.skillName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            skillName: e.target.value,
                          })
                        }
                        placeholder="e.g. React"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 dark:focus:ring-gray-100 dark:focus:border-gray-100 dark:bg-gray-800 dark:text-white text-sm"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
                        placeholder="e.g. Programming"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 dark:focus:ring-gray-100 dark:focus:border-gray-100 dark:bg-gray-800 dark:text-white text-sm"
                        required
                      />
                    </div>

                    {/* Target Hours */}
                    <div>
                      <label
                        htmlFor="targetHours"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Target hours
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
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 dark:focus:ring-gray-100 dark:focus:border-gray-100 dark:bg-gray-800 dark:text-white text-sm"
                        min="1"
                        required
                      />
                    </div>

                    {/* Color */}
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
                          setFormData({
                            ...formData,
                            skillColor: e.target.value,
                          })
                        }
                        className="block mt-1 w-32 h-8 rounded-md "
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={openDrawer}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
                    >
                      Add skill
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}