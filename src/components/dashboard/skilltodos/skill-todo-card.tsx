"use client";
import { skillTodo } from "@/types/skillDashboardTypes";
import { CheckCircle, PencilLine, Tag, Timer } from "lucide-react";
import React, { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import DeleteModal from "@/components/modals/DeleteModal";
import { formatDuration } from "@/utils/format-time";
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

      {/* ----------------------------task card ---------------------------- */}
      <motion.div
        variants={taskCardVariants}
        animate={{
          scale: todo.done ? 0.98 : 1,
          transition: { duration: 0.3, ease: "easeInOut" },
        }}
        className={` relative ml-6 rounded-xl p-2    transition-all duration-300 group ${
          todo.done
            ? "  border-black/5 bg-gray-50 opacity-60 dark:border-white/5 dark:bg-[#0a0a0b]   "
            : " border border-black/10 bg-white shadow-sm hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-[#121214] dark:hover:border-white/20"
        }`}
      >
        <div
          className={` group  flex items-start gap-4 transition-all duration-300 p-2  `}
        >
          {/* toggle check/uncheck task */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggleDone(!todo.done)}
            className={` mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
              todo.done
                ? "bg-emerald-600 text-white"
                : "border-neutral-300 bg-transparent text-transparent hover:border-emerald-500 dark:border-neutral-600"
            }`}
          >
            <CheckCircle size={14} />
          </motion.button>

          {/* -----------main content of task card */}
          <div className="min-w-0 flex-1  ">
            <div className="flex items-start justify-between   ">
              <h3
                className={`text-sm font-medium transition-all  ${
                  todo.done
                    ? " text-neutral-500 line-through decoration-neutral-400"
                    : "text-primary"
                }`}
              >
                {todo.title}
              </h3>

              {/* secondary action buttons */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  disabled={isUpdating}
                  className={`flex items-center px-2 py-2 rounded-lg opacity-0 group-hover:opacity-100 hover:text-blue-500 transition-all duration-300 cursor-pointer  `}
                  aria-label="Edit task"
                  title="Edit task details"
                >
                  <PencilLine size={14} />
                </motion.button>

                <DeleteModal onDelete={handleDelete} />
              </div>
            </div>
            {todo.description && (
              <p className={`  whitespace-pre-line  text-xs text-neutral-500 `}>
                {todo.description}
              </p>
            )}

            <div className="flex flex-wrap justify-between gap-4 pt-4">
              <div className="flex items-center justify-between">
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {todo.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-1 rounded-md border border-black/5 bg-black/5 px-2 py-0.5 text-[10px] text-neutral-500 dark:border-white/5 dark:bg-white/5 dark:text-neutral-400`}
                      >
                        <Tag size={10} />
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              {/* time log section  */}
              <div className=" flex">
                <div className="flex items-center gap-2">
                  {/* Compact time display for completed tasks */}

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border"
                  >
                    <Timer size={14} />
                    <span className="text-xs font-medium ">
                      {formatDuration(displayMinutes)}
                    </span>
                  </motion.div>
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
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
