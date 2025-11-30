"use client";
import { Skill } from "@/types/skillDashboardTypes";
import SkillCard from "./skill-card";
import DashboardHeader from "../header/DashboardHeader";
import OverviewCards from "../analytics-components/OverviewCards";
import InsightsCards from "../analytics-components/InsightsCards";
import { useAddSkillCard, useSkillCards } from "@/hooks/useSkillCardsHook";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

import BouncingBarsLoader from "@/components/ui/BouncingBars";
import AddSkillModal from "./add-skill-modal";
import { Plus, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function SkillDashboard() {
  const [filter, setFilter] = useState("All");
  const { data: skills = [], isLoading, error } = useSkillCards();
  const addSkillMutation = useAddSkillCard();

  const handleAddSkill = async (
    newSkill: Omit<Skill, "id" | "currentHours" | "slug" | "createdAt">
  ) => {
    const skillToAdd = {
      skillName: newSkill.skillName,
      category: newSkill.category,
      targetHours: newSkill.targetHours,
      skillColor: newSkill.skillColor,
      description: newSkill.description || undefined,
    };

    try {
      await toast.promise(addSkillMutation.mutateAsync(skillToAdd), {
        loading: "Adding skill...",
        success: `${skillToAdd.skillName} added successfully!`,
        error: "Failed to add skill. Please try again.",
      });
    } catch (error) {
      console.error("Failed to add skill:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="dark:bg-zinc-950 min-h-screen flex flex-col items-center justify-center space-y-4 p-4  border border-gray-300 dark:border-gray-800 rounded-2xl">
        <BouncingBarsLoader />
        <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
          Fetching skill data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark:bg-zinc-950 p-4 m-3 border border-gray-300 dark:border-gray-800 rounded-2xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading skills: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" p-4 ">
      <DashboardHeader />
      <OverviewCards />
      <InsightsCards />
      <div>
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-surfaceHighlight/50 p-1 rounded-lg border border-border">
            {["All", "Active", "Not Started", "Paused"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filter === f
                    ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <AddSkillModal onAddSkill={handleAddSkill} />
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
            <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
              <SlidersHorizontal size={14} />
              Filter
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          <AnimatePresence mode="popLayout">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </AnimatePresence>
          {/* Add New Ghost Card */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="group relative flex flex-col items-center justify-center p-6 border border-dashed border-border rounded-xl hover:bg-surfaceHighlight/50 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 min-h-[200px]"
          >
            <div className="w-10 h-10 rounded-full bg-surfaceHighlight flex items-center justify-center border border-border group-hover:scale-110 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-all duration-300">
              <Plus
                size={20}
                className="text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              />
            </div>
            <span className="mt-3 text-xs font-medium text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
              Create new project
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}