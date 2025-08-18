"use client";
import { Skill } from "@/types/skillDashboardTypes";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, PlusIcon, X } from "lucide-react";

interface AddSkillModalProps {
  onAddSkill: (
    skill: Omit<Skill, "id" | "currentHours" | "slug" | "createdAt">
  ) => void;
}

export default function AddSkillModal({ onAddSkill }: AddSkillModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    skillName: "",
    category: "",
    targetHours: 10000,
    skillColor: "#6366f1",
    description: "",
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

      <button className="cssbuttons-io-button" onClick={openDrawer}>
        Add Skill
        <div className="icon">
          <Plus />
        </div>
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
              className="fixed w-full inset-0 z-50 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
              onClick={openDrawer}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-xl "
            >
              <div className=" bg-white dark:bg-zinc-900 rounded-t-xl shadow-lg border-t border-gray-200 dark:border-gray-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                  <div>
                    <h3 className="text-2xl font-semibold capitalize">
                      Add new skill
                    </h3>
                    <p className="text-sm text-zinc-800 dark:text-zinc-400 font-semibold">
                      Track your learning journey
                    </p>
                  </div>
                  <button onClick={openDrawer} className="">
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 pb-6">
                  <div className="space-y-4">
                    {/* Skill Name */}
                    <div className="space-y-2">
                      <label
                        htmlFor="skillName"
                        className="block text-sm capitalize font-medium  mb-1"
                      >
                        Skill / Project name *
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
                        placeholder="e.g. React, Spanish , Guitar"
                        className="block w-full px-3 py-2 border rounded-sm shadow-sm  text-sm"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium  mb-1"
                      >
                        Category *
                      </label>
                      <input
                        type="text"
                        id="category"
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        placeholder="e.g. Programming, Language, Music , Business"
                        className="block w-full px-3 py-2 border rounded-sm text-sm"
                        required
                      />
                      <p className="text-xs text-zinc-400">
                        {" "}
                        Add a category or label
                      </p>
                    </div>

                    {/* Target Hours */}
                    <div className="space-y-2">
                      <label
                        htmlFor="targetHours"
                        className="block text-sm font-medium  mb-1"
                      >
                        Target hours *
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
                        className="block w-full px-3 py-2 border rounded-sm shadow-sm  text-sm"
                        min="1"
                        required
                      />
                      <p className="text-xs text-zinc-400">
                        How many hours do you want to invest?
                      </p>
                    </div>
                    {/* Description */}
                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium  mb-1"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Add any overview note, Goals and extra Context"
                        className="block w-full px-3 py-2 border rounded-sm shadow-sm text-sm"
                        rows={3}
                      />
                    </div>

                    {/* Color */}
                    <div className="space-y-2">
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
                        className="block mt-1 w-full h-8 rounded-md  "
                      />
                      <p className="text-xs text-zinc-400">
                        Select color also for differentiating with others cards
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={openDrawer}
                      className="flex-1 px-4 py-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all duration-200 font-medium border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 dark:hover:text-zinc-800 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Save Skill
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