"use client";
import { skillTodo } from "@/types/skillDashboardTypes";
import {
  Calendar,
  CheckCheck,
  ChevronRight,
  Hourglass,
  Link2,
  LinkIcon,
  Pencil,
} from "lucide-react";
import React from "react";

import { AnimatePresence, motion } from "framer-motion";
import DeleteModal from "@/components/modals/DeleteModal";
import { formatDate, formatDuration } from "@/utils/format-time";
import {
  dateIndicatorVariants,
  taskCardVariants,
} from "@/components/animations/taskCardAnimations";
import { useSkillTodoCard } from "../TodoCard/useSkillTodoCard";
import SkillTodoEditor from "../TodoCard/SkillTodoEditor";
import ResourceExpand from "../TodoCard/ResourceExpand";

interface SkillTodoCardProps {
  todo: skillTodo; //the task data
  onUpdateTime: (todoId: string, minutes: number) => void;
  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
  toggleIsdone: (todoId: string, done: boolean) => void;
  onDeleteTodo: (todoId: string) => void;
  //optional props to indicate loading states controlled by the parent component
  isUpdating?: boolean;
  isDeleting?: boolean;
  onOpenModal: () => void;
}

export default function SkillTodoCard({
  todo,
  onUpdateTime,
  onEditTodo,
  onDeleteTodo,
  toggleIsdone,
  onOpenModal,
  isUpdating = false,
  isDeleting = false,
}: SkillTodoCardProps) {
  const {
    isEditing,
    isExpanded,
    toggleExpand,
    startEdit,
    cancelEdit,
    finishEdit,
  } = useSkillTodoCard();

  //state variables to hold the edited values while the form is active
  // initialize with current todo values when editing starts

  // event handlers
  const handleTimeBlockClick = (blockIndex: number) => {
    //calculate the target duration in minutes based on the clicked block
    const targetMinutes = (blockIndex + 1) * 30;
    if (
      targetMinutes === todo.duration + 30 ||
      (targetMinutes < todo.duration && targetMinutes + 30 > todo.duration)
    ) {
      onUpdateTime(todo.id, targetMinutes);
    }
  };

  const handleEdit = () => {
    startEdit();
  };

  // rendering the form when the form is being edited
  if (isEditing) {
    return (
      <SkillTodoEditor
        todo={todo}
        onSave={(updatedTodo) => {
          onEditTodo(todo.id, updatedTodo);
          finishEdit();
        }}
        onCancel={cancelEdit}
        isSaving={isUpdating}
      />
    );
  }
  //?-------------------------------------- return the display card when the todocard is not in editing state-==========
  return (
    <>
      {/* Date indicator */}
      <motion.div
        className="absolute -left-5 flex items-center justify-center w-[40px] h-[40px] rounded-full bg-white dark:bg-black shadow-md border-2 border-blue-300 dark:border-gray-40 "
        variants={dateIndicatorVariants}
      >
        <Calendar size={20} className="text-blue-400 dark:text-gray-300" />
      </motion.div>

      <motion.div
        variants={taskCardVariants}
        className={` relative ml-6 rounded-xl p-4 shadow-sm  hover:shadow-lg  border border-gray-200 dark:border-gray-700 transition-all duration-300 group ${
          todo.done
            ? "bg-green-50 dark:bg-gray-800"
            : "dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-900"
        }`}
      >
        <div className="space-y-4">
          {/* top section of edit delete and tag  */}
          <div className="flex justify-between items-start gap-4">
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
                        className=" inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium rounded-full capitalize border border-blue-200 dark:border-blue-700"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                )}
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                  {formatDate(todo.date)}
                </span>
              </div>
            </div>
            <AnimatePresence>
              {todo.done && (
                <motion.div
                  className="flex items-center space-x-1 text-green-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <CheckCheck size={10} />
                  <span className="text-xs font-medium">Done</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* main content title and description */}
          <div className="space-y-3">
            <h3
              className={`${
                todo.done
                  ? "line-through text-gray-400 dark:text-gray-500 text-lg "
                  : "text-xl font-semibold leading-tight"
              } `}
            >
              {todo.title}
            </h3>
            {todo.description && (
              <p
                className={` text-sm leading-relaxed  break-words whitespace-pre-line ${
                  todo.done
                    ? "text-gray-400 dark:text-gray-600"
                    : "text-gray-600 dark:text-gray-300"
                }`}
              >
                {todo.description}
              </p>
            )}
          </div>

          <div className=" flex items-center justify-between">
            {/* Time Tracking Section */}
            <div className=" w-full mx-4 p-3  rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-900/30 dark:to-indigo-900/30 dark:border-blue-800">
              <div className="flex items-center justify-between ">
                {/* Time Spent */}
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center shadow-sm">
                    <Hourglass size={10} />
                  </div>
                  <div className="mr-2">
                    <p
                      className={`text-xs font-medium text-blue-600 dark:text-blue-300 `}
                    >
                      Tracked: {formatDuration(todo.duration)}
                    </p>
                  </div>
                </div>
                {/* time block list of array cirlces */}
                <div className="flex items-center gap-2 ">
                  {[...Array(5)].map((_, index) => {
                    const isActive = todo.duration >= (index + 1) * 30;
                    const isNext = todo.duration === index * 30;
                    const minuteLabel = (index + 1) * 30;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleTimeBlockClick(index)}
                        disabled={
                          isUpdating || isDeleting || (!isActive && !isNext)
                        }
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`relative w-6 h-6 rounded-md border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
                          isActive
                            ? "bg-green-500 border-green-500 shadow-md"
                            : isNext
                            ? "border-green-400 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                            : "border-gray-300 dark:border-gray-600 opacity-40 cursor-not-allowed"
                        }`}
                        aria-label={`${minuteLabel} minute milestone ${
                          isActive
                            ? "completed"
                            : isNext
                            ? "available"
                            : "locked"
                        }`}
                        title={`${minuteLabel} minutes`}
                      >
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-1 bg-white rounded-full"
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* action buttons */}
            <div className="flex items-center space-x-2 p-2 rounded-lg border bg-gray-50 border-border dark:bg-gray-800/50">
              {/* toggle check/uncheck task */}
              <motion.input
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleIsdone(todo.id, !todo.done)}
                className="h-5 w-5 rounded-md border-2"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenModal}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                title="Add resources"
              >
                <LinkIcon size={14} />
                <span className="text-[10px] font-medium hidden sm:inline">
                  Resources
                </span>
              </motion.button>

              {/* resource expand button  */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleExpand}
                className="flex items-center  px-2 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                title={`${isExpanded ? "Hide" : "Show"} resources`}
                aria-expanded={isExpanded}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {todo.resourceLink ? (
                    <motion.div
                      key="resource"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative"
                    >
                      <Link2 size={18} />

                      <span className="absolute -top-1 -right-1 bg-green-500 text-white text-[10px] leading-none font-semibold px-1.5 py-0.5 rounded-full">
                        {Array.isArray(todo.resourceLink)
                          ? todo.resourceLink.length
                          : 1}
                      </span>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="chevron"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                    >
                      <ChevronRight size={16} />
                    </motion.div>
                  )}
                </motion.div>
              </motion.button>
              {/* secondary action buttons */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  disabled={isUpdating}
                  className="flex items-center  px-2 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Edit task"
                  title="Edit task details"
                >
                  <Pencil size={14} />
                </motion.button>
                <DeleteModal onDelete={() => onDeleteTodo(todo.id)} />
              </div>
            </div>
          </div>
          {/* Expandable resources section with improved animation */}
          <ResourceExpand todo={todo} isExpanded={isExpanded} />
        </div>
      </motion.div>
    </>
  );
}
