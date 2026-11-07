"use client";
import { Skill } from "@/types/skillDashboardTypes";
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Sparkles, XIcon } from "lucide-react";

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
    targetHours: 35,
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

      <button
        onClick={openDrawer}
        className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-black/5"
      >
        <Plus size={14} />
        <span>New Project/Skill</span>
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
              className="fixed w-full inset-0 z-50   bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4"
              onClick={openDrawer}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg bg-surface border border-border rounded-2xl shadow-2xl  overflow-hidden "
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-surface-highlight/30">
                <div>
                  <h3 className="text-base font-semibold text-zinc-900 dark:text-white">
                    New Project
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Define your next skill acquisition journey.
                  </p>
                </div>
                <button
                  onClick={openDrawer}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <XIcon />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5 ">
                {/* Skill Name */}
                <div>
                  <label
                    htmlFor="skillName"
                    className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide"
                  >
                    Project Name
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
                    className="w-full bg-surface-highlight placeholder:text-xs border border-border rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide"
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
                      placeholder="Coding, Communication"
                      className="w-full bg-surface-highlight placeholder:text-xs border border-border rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                      required
                    />
                  </div>

                  {/* Target Hours */}
                  <div>
                    <label
                      htmlFor="targetHours"
                      className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide"
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
                      className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all"
                      min="5"
                      required
                    />
                  </div>
                </div>
                {/* Description */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                      Description
                    </label>
                    <button className="group relative flex items-center justify-center gap-2 px-3 py-1 text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />
                      <Sparkles
                        size={12}
                        className="text-indigo-400 group-hover:text-indigo-200 transition-colors"
                      />
                      <span className="relative z-10 ">AI Estimate</span>
                    </button>
                  </div>
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
                    className="w-full bg-surface-highlight border border-border rounded-lg px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-zinc-500"
                    rows={3}
                  />
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label
                    htmlFor="skillColor"
                    className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide"
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
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={openDrawer}
                    className="px-4 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors shadow-lg shadow-black/5 dark:shadow-white/5"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}