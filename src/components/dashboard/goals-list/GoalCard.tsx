"use client";
import { CalendarPlus, CalendarCheck, PenLine, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Goal {
  id: string;
  userId: string;
  title: string;
  startDate?: string | null;
  completedDate?: string | null;
  daysToComplete?: number | null;
  reflectionNote?: string | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GoalCardProps {
  goal: Goal;
  onStartDateSet: (id: string, date: string) => void;
  onToggleComplete: (id: string) => void;
  onReflectionAdd: (id: string, note: string) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({ goal, onStartDateSet, onToggleComplete, onReflectionAdd, onDelete }: GoalCardProps) {
  const [isAddingReflection, setIsAddingReflection] = useState(false);
  const [reflectionText, setReflectionText] = useState(goal.reflectionNote || "");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleStartDateClick = () => {
    const today = new Date().toISOString().split("T")[0];
    onStartDateSet(goal.id, today);
  };

  const handleToggleComplete = () => {
    onToggleComplete(goal.id);
  };

  const handleReflectionSubmit = () => {
    onReflectionAdd(goal.id, reflectionText);
    setIsAddingReflection(false);
  };

  const handleDelete = () => {
    if (isConfirmingDelete) {
      onDelete(goal.id);
    } else {
      setIsConfirmingDelete(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setIsConfirmingDelete(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br dark:from-zinc-900/80 dark:to-zinc-900/40 backdrop-blur-sm p-6 rounded-xl border dark:border-zinc-800/50 shadow-lg group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleComplete}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              goal.isCompleted
                ? "bg-purple-500 border-purple-500"
                : "border-zinc-600 hover:border-purple-500"
            }`}
          >
            {goal.isCompleted && <CalendarCheck className="w-4 h-4 text-white" />}
          </button>
          <div>
            <h3 className={`font-semibold ${goal.isCompleted ? "line-through text-zinc-500" : ""}`}>
              {goal.title}
            </h3>
            {goal.startDate && !goal.isCompleted && (
              <p className="text-sm text-zinc-500">
                Started on {format(new Date(goal.startDate), "MMM d, yyyy")}
              </p>
            )}
            {goal.completedDate && (
              <p className="text-sm text-zinc-500">
                Completed in {goal.daysToComplete} days
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!goal.startDate && !goal.isCompleted && (
            <button
              onClick={handleStartDateClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              Set Start Date
            </button>
          )}

          {goal.isCompleted && !goal.reflectionNote && !isAddingReflection && (
            <button
              onClick={() => setIsAddingReflection(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-500 hover:text-purple-400 transition-colors"
            >
              <PenLine className="w-4 h-4" />
              Add Reflection
            </button>
          )}

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
        </div>
      </div>

      {isAddingReflection && (
        <div className="mt-4 space-y-3">
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            placeholder="Write your reflection..."
            className="w-full h-24 px-4 py-2 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAddingReflection(false)}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReflectionSubmit}
              className="px-4 py-2 text-sm font-medium bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
            >
              Save Reflection
            </button>
          </div>
        </div>
      )}

      {goal.reflectionNote && (
        <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg">
          <p className="text-sm text-zinc-400">{goal.reflectionNote}</p>
        </div>
      )}
    </motion.div>
  );
} 