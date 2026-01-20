"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Target,
  Trash2,
  Hourglass,
  Sparkles,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getGoals, addGoal, deleteGoal } from "@/actions/goalActions";

interface Goal {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  userId: string;
}

export default function EightyHourGoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const fetchedGoals = await getGoals();
        setGoals(fetchedGoals as Goal[]);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    try {
      const slug = `${generateSlug(newGoal.trim())}-${Math.random().toString(36).substring(2, 7)}`;
      const addedGoal = await addGoal({ 
        title: newGoal.trim(),
        slug: slug
      });
      setGoals((prev) => [addedGoal as Goal, ...prev]);
      setNewGoal("");
    } catch (error) {
      console.error("Failed to add goal:", error);
    }
  };

  const handleDeleteGoal = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error("Failed to delete goal:", error);
    }
  };

  const handleGoalClick = (slug: string) => {
    router.push(`/dashboard/80-hour-goals/${slug}`);
  };

  return (
    <div className="max-w-400 mx-auto p-6 space-y-10 min-h-screen">
      {/* Unified Compact Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4 border-b border-border/50">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Hourglass size={22} className="text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              80 Hour Goals
            </h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            Break down your mastery into intensive sprints.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:max-w-xl"
        >
          <form onSubmit={handleAddGoal} className="relative group">
            <div className="relative flex items-center">
              <div className="absolute left-3 text-muted-foreground">
                <Target size={18} />
              </div>
              <input
                id="goal"
                type="text"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter a new 80-hour goal..."
                className="w-full bg-muted/30 border border-border text-sm text-foreground pl-10 pr-24 py-3 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-muted-foreground shadow-sm"
              />
              <div className="absolute right-1.5 top-1.5 bottom-1.5">
                <button
                  type="submit"
                  className="h-full bg-foreground text-background hover:opacity-90 px-6 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-md"
                >
                  <Plus size={14} strokeWidth={3} />
                  Start Sprint
                </button>
              </div>
            </div>
          </form>

          {/* Example Chips */}
          <div className="flex flex-wrap items-center gap-2 mt-3 ml-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mr-1">
              Examples:
            </span>
            {["Learn react hooks", "Make $500", "Upload 2 videos"].map(
              (text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setNewGoal(text)}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-muted/50 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                >
                  {text}
                </button>
              ),
            )}
          </div>
        </motion.div>
      </div>

      {/* Square Goal Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
             // Skeleton loader could go here, or just a spinner
             <div className="col-span-full text-center text-muted-foreground py-10">Loading goals...</div>
        ) : (
        <AnimatePresence mode="popLayout">
          {goals.map((goal) => (
            <motion.div
              key={goal.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              onClick={() => handleGoalClick(goal.slug)}
              className="group flex flex-col bg-card border border-border p-5 rounded-2xl hover:border-blue-500/30 cursor-pointer transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/5 relative overflow-hidden"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full -mr-12 -mt-12 transition-colors group-hover:bg-blue-500/10"></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all border border-border group-hover:border-blue-500/20">
                  <Sparkles size={20} />
                </div>
                <button
                  onClick={(e) => handleDeleteGoal(goal.id, e)}
                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 relative z-10">
                <h3 className="text-foreground font-semibold text-[15px] leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                  {goal.title}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Calendar size={12} />
                  <span className="text-[11px] font-medium">
                    {new Date(goal.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mt-8 pt-5 border-t border-border/50 relative z-10">
                <div className="flex justify-between items-end mb-2.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Intensity
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      0 / 80 Hours
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    0%
                  </div>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.4)] transition-all duration-500"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        )}

        {/* Empty State */}
        {!isLoading && goals.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-muted/5">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4 border border-border">
              <Target size={32} className="opacity-20" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              No active goals found
            </p>
            <p className="text-xs mt-1">
              Add your first 80-hour sprint to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
