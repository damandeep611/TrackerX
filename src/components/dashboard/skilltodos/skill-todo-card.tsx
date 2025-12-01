"use client";
import { skillTodo } from "@/types/skillDashboardTypes";
import { CheckSquareIcon, EditIcon, Hourglass, SquareIcon } from "lucide-react";
import React, { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import DeleteModal from "@/components/modals/DeleteModal";
import { formatDate, formatDuration } from "@/utils/format-time";
import {
  dateIndicatorVariants,
  taskCardVariants,
} from "@/components/animations/taskCardAnimations";
import { useSkillTodoCard } from "../TodoCard/useSkillTodoCard";
import SkillTodoEditor from "../TodoCard/SkillTodoEditor";
import TimeBlockList from "./TimeBlockList";
import { createTimeLog } from "@/actions/timeLogAction";
import toast from "react-hot-toast";

interface SkillTodoCardProps {
  todo: skillTodo; //the task data
  timeLogMinutes?: number; // Time data from parent component
  isLoadingTime?: boolean; // Loading state from parent component

  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
  toggleIsdone: (todoId: string, done: boolean) => void;
  onDeleteTodo: (todoId: string) => void;
  //optional props to indicate loading states controlled by the parent component
  isUpdating?: boolean;
  isDeleting?: boolean;
  onTimeLogCreated?: () => void; // Callback to refresh time data after successful time log creation
}

export default function SkillTodoCard({
  todo,
  timeLogMinutes: propTimeLogMinutes,
  isLoadingTime: propIsLoadingTime,

  onEditTodo,
  onDeleteTodo,
  toggleIsdone,

  isUpdating = false,
  isDeleting = false,
  onTimeLogCreated,
}: SkillTodoCardProps) {
  const {
    isEditing,

    startEdit,
    cancelEdit,
    finishEdit,
  } = useSkillTodoCard();

  // State for time tracking - Use props from parent component
  const [optimisticMinutes, setOptimisticMinutes] = useState<number | null>(
    null
  );

  // Use time data from props if available, otherwise fallback to 0
  const timeLogMinutes = propTimeLogMinutes ?? 0;
  const isLoadingTime = propIsLoadingTime ?? false;
  // dates of todos
  const date = new Date(todo.date);
  const taskday = date.toLocaleDateString("en-US", { day: "2-digit" });
  const taskmonth = date.toLocaleDateString("en-US", { month: "short" });
  // const taskyear = date.toLocaleDateString("en-US", { year: "numeric" });

  // Use optimistic updates if available, otherwise use time logs
  // Legacy duration is handled separately in TimeBlockList component
  const displayMinutes =
    optimisticMinutes !== null ? optimisticMinutes : timeLogMinutes;

  // Time tracking integration handler
  // This function handles time updates from the TimeBlockList component
  // It creates time log entries in the database and updates the skill card's current hours
  const handleTimeUpdate = async (minutes: number) => {
    try {
      // Calculate the difference in minutes to log
      const currentTimeLogTotal = timeLogMinutes;
      const difference = minutes - currentTimeLogTotal;

      console.log(
        `Time update: ${currentTimeLogTotal} -> ${minutes} (difference: ${difference})`
      );

      // Only proceed if there's an actual change
      if (difference === 0) {
        console.log("No time change detected");
        return;
      }

      // Optimistic update for immediate UI feedback - keep it until confirmed
      setOptimisticMinutes(minutes);

      if (difference > 0) {
        // Create a time log entry for the additional time
        console.log(
          `Creating time log for task ${todo.id}: ${difference} minutes`
        );

        const result = await createTimeLog({
          task_id: todo.id,
          skill_id: todo.skill_id,
          minutes: difference,
          logged_date: new Date().toISOString().split("T")[0], // Today's date
        });

        if (result.success) {
          // Keep optimistic update and show success toast
          toast.success(`Added ${formatDuration(difference)} to task`);
          console.log("✅ Time log created successfully:", result.timeLog);

          // Only refresh the specific task's time data, not all tasks
          onTimeLogCreated?.();
        } else {
          console.error("❌ Failed to create time log:", result.error);
          // Revert optimistic update on failure
          setOptimisticMinutes(null);
          toast.error("Failed to update time. Please try again.");
        }
      } else if (difference < 0) {
        // For time reduction, use legacy system but keep optimistic update
        console.log(`Reducing time for task ${todo.id}: ${difference} minutes`);

        toast.success(`Updated task time to ${formatDuration(minutes)}`);
      }
    } catch (error) {
      console.error("❌ Error updating time:", error);
      // Revert optimistic update on error
      setOptimisticMinutes(null);
      toast.error("Failed to update time. Please try again.");
    }
  };

  const handleEdit = () => {
    startEdit();
  };

  // Add toast notifications for other actions
  const handleToggleDone = (done: boolean) => {
    toggleIsdone(todo.id, done);
    toast.success(
      done ? "Task marked as completed!" : "Task marked as incomplete"
    );
  };

  const handleDelete = () => {
    onDeleteTodo(todo.id);
    toast.success("Task deleted successfully");
  };

  const handleSaveEdit = (updatedTodo: Partial<skillTodo>) => {
    onEditTodo(todo.id, updatedTodo);
    finishEdit();
    toast.success("Task updated successfully");
  };

  // rendering the form when the form is being edited
  if (isEditing) {
    return (
      <SkillTodoEditor
        todo={todo}
        onSave={handleSaveEdit}
        onCancel={cancelEdit}
        isSaving={isUpdating}
      />
    );
  }

  //?-------------------------------------- return the display card when the todocard is not in editing state-==========
  return (
    <>
      <motion.div
        className="absolute -left-5 flex  items-center justify-center  rounded-2xl bg-white dark:bg-zinc-800  shadow-md  "
        variants={dateIndicatorVariants}
      >
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg border border-neutral-200 bg-white shadow-sm transition-transform hover:scale-105 dark:border-neutral-800 dark:bg-neutral-900">
          <span className="text-[8px] font-bold uppercase leading-none text-red-500 mb-0.5">
            {taskmonth}
          </span>
          <span className="text-lg font-bold leading-none tracking-tight text-gray-900 dark:text-white">
            {taskday}
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={taskCardVariants}
        animate={{
          scale: todo.done ? 0.98 : 1,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        className={` relative ml-6 rounded-xl p-2   shadow-sm  hover:shadow-lg  border  transition-all duration-300 group ${
          todo.done
            ? " border-black/5 bg-gray-50 opacity-60 dark:border-white/5 dark:bg-[#0a0a0b]   "
            : " border-black/10 bg-white shadow-sm hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-[#121214] dark:hover:border-white/20"
        }`}
      >
        <div
          className={` transition-all duration-300 ${
            todo.done ? "p-2 space-y-2" : "p-3 space-y-3"
          }`}
        >
          <div className="flex justify-between items-center gap-4">
            {/* left side of the top section  */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {todo.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full capitalize border transition-all duration-300 ${
                          todo.done
                            ? "text-emerald-400/70 dark:text-emerald-700/70 "
                            : "dark:text-zinc-300 dark:bg-zinc-800 text-zinc-700 bg-zinc-100 border-zinc-300 dark:border-zinc-600"
                        }`}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}
                <span
                  className={`text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    todo.done
                      ? "text-emerald-400/70 dark:text-emerald-700/70"
                      : "text-gray-500 dark:text-zinc-500"
                  }`}
                >
                  {formatDate(todo.date)}
                </span>
              </div>
            </div>
            {/* ====================================action buttons================= */}
            <div className="flex items-center space-x-2 p-2 ">
              {/* toggle check/uncheck task */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleToggleDone(!todo.done)}
                className={`p-2 rounded-md transition-all ${
                  todo.done
                    ? "bg-emerald-600 text-white"
                    : "dark:hover:bg-zinc-800 text-zinc-400"
                }`}
              >
                {todo.done ? (
                  <CheckSquareIcon size={16} />
                ) : (
                  <SquareIcon size={16} />
                )}
              </motion.button>

              <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1"></div>
              {/* secondary action buttons */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  disabled={isUpdating}
                  className={`flex items-center px-2 py-2 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    todo.done
                      ? "text-emerald-600/70 dark:text-emerald-400/70 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20"
                      : "text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  }`}
                  aria-label="Edit task"
                  title="Edit task details"
                >
                  <EditIcon size={16} />
                </motion.button>
                <DeleteModal onDelete={handleDelete} />
              </div>
            </div>
          </div>
          {/* main content title and description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3
                className={`text-lg capitalize leading-tight font-semibold transition-all duration-300 ${
                  todo.done
                    ? " text-emerald-900/70 dark:text-emerald-800/70"
                    : "text-gray-900 dark:text-gray-100"
                }`}
              >
                {todo.title}
              </h3>
              {/* Compact time display for completed tasks */}
              {todo.done && displayMinutes > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-100/70 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50"
                >
                  <Hourglass
                    size={12}
                    className="text-emerald-600/80 dark:text-emerald-400/80"
                  />
                  <span className="text-xs font-medium text-emerald-700/80 dark:text-emerald-300/80">
                    {formatDuration(displayMinutes)}
                  </span>
                </motion.div>
              )}
            </div>

            {todo.description && (
              <p
                className={` break-words whitespace-pre-line transition-all duration-300 ${
                  todo.done
                    ? " text-xs  text-emerald-900/70 dark:text-emerald-800/80"
                    : " text-xs text-gray-600 dark:text-gray-300"
                }`}
              >
                {todo.description}
              </p>
            )}
          </div>
          <AnimatePresence>
            {!todo.done && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <TimeBlockList
                  currentMinutes={displayMinutes}
                  onTimeUpdate={handleTimeUpdate}
                  isUpdating={isUpdating || isLoadingTime}
                  isDeleting={isDeleting}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
}
