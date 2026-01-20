"use client";
import { CalendarPlus, CalendarCheck, Trash2, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import Link from "next/link";

interface Goal {
  id: string;
  userId: string;
  title: string;
  slug: string;
  startDate?: string | null;
  completedDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GoalCardProps {
  goal: Goal;
  onStartDateSet: (id: string, date: string) => void;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({ goal, onStartDateSet, onToggleComplete, onDelete }: GoalCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isCompleted = !!goal.completedDate;

  const handleStartDateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const today = new Date().toISOString().split("T")[0];
    onStartDateSet(goal.id, today);
  };

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleComplete(goal.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isConfirmingDelete) {
      onDelete(goal.id);
    } else {
      setIsConfirmingDelete(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  const daysToComplete = goal.startDate && goal.completedDate 
    ? differenceInDays(new Date(goal.completedDate), new Date(goal.startDate))
    : null;

  return (
    <Link href={`/dashboard/80-hour-goals/${goal.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-br dark:from-zinc-900/80 dark:to-zinc-900/40 backdrop-blur-sm p-6 rounded-xl border dark:border-zinc-800/50 shadow-lg group cursor-pointer hover:border-purple-500/50 transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleComplete}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                isCompleted
                  ? "bg-purple-500 border-purple-500"
                  : "border-zinc-600 hover:border-purple-500"
              }`}
            >
              {isCompleted && <CalendarCheck className="w-4 h-4 text-white" />}
            </button>
            <div>
              <h3 className={`font-semibold ${isCompleted ? "line-through text-zinc-500" : ""}`}>
                {goal.title}
              </h3>
              {goal.startDate && !isCompleted && (
                <p className="text-sm text-zinc-500">
                  Started on {format(new Date(goal.startDate), "MMM d, yyyy")}
                </p>
              )}
              {goal.completedDate && (
                <p className="text-sm text-zinc-500">
                  Completed on {format(new Date(goal.completedDate), "MMM d, yyyy")}
                  {daysToComplete !== null && ` (${daysToComplete} days)`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!goal.startDate && !isCompleted && (
              <button
                onClick={handleStartDateClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                Set Start Date
              </button>
            )}

            <div className="flex items-center gap-1">
              <button
                onClick={handleDelete}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isConfirmingDelete
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {isConfirmingDelete ? "Confirm" : ""}
              </button>
              
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
} 