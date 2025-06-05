"use client";
import { skillTodo } from "@/types/skillDashboardTypes";
import { formatUrl } from "@/utils/format-url";
import { Calendar, ChevronRight, Link, LinkIcon, Pencil } from "lucide-react";
import React, { useState } from "react";
import TagInput from "./tag-input";
import { motion } from "framer-motion";
import DeleteModal from "@/components/modals/DeleteModal";
import { formatDuration } from "@/utils/format-time";

interface SkillTodoCardProps {
  todo: skillTodo; //the task data
  //Callbacks to the parent list component
  onUpdateTime: (todoId: string, minutes: number) => void;
  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
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
  onOpenModal,
  isUpdating = false,
  isDeleting = false,
}: SkillTodoCardProps) {
  // state management for local states
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  //state variables to hold the edited values while the form is active
  // initialize with current todo values when editing starts
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedResourceLink, setEditedResourceLink] = useState(
    todo.resourceLink || ""
  );
  // to show the resource modal to add links to tasks
  const [editedDescription, setEditedDescription] = useState(
    todo.description || ""
  );
  const [editedTags, setEditedTags] = useState<string[]>(todo.tags || []);
  //state for displaying validation error within the editing form
  const [validationError, setValidationError] = useState("");

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
    setIsEditing(true);
    setEditedTitle(todo.title);
    setEditedResourceLink(todo.resourceLink || "");
    setEditedDescription(todo.description || "");
    setEditedTags(todo.tags || []);
    setValidationError("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setValidationError("");
  };

  const handleSaveEdit = () => {
    if (!editedTitle.trim()) {
      setValidationError("Title is required");
      return;
    }
    onEditTodo(todo.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim() || null,
      resourceLink: editedResourceLink.trim() || null,
      tags: editedTags,
    });
    setIsEditing(false);
    setValidationError("");
  };

  //utility function to format time


  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // rendering the form when the form is being edited
  if (isEditing) {
    return (
      <div className="   rounded-md p-6 shadow-sm hover:shadow-md border border-border transition-shadow">
        <div className="space-y-3 ">
          {/* title of todo being edited */}
          <div className="">
            <label
              htmlFor={`edit-title-${todo.id}`}
              className="block text-sm font-medium mb-1"
            >
              Task title
            </label>
            <input
              type="text"
              id={`edit-title${todo.id}`}
              value={editedTitle}
              onChange={(e) => {
                setEditedTitle(e.target.value);
                if (validationError) setValidationError("");
              }}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                validationError ? "border-red-500" : ""
              }`}
              disabled={isUpdating}
              autoFocus
            />
            {validationError && (
              <p className="text-red-600">{validationError}</p>
            )}
          </div>
          {/* editing the optinal tag */}
          <div>
            <label
              htmlFor={`edit-tags-${todo.id}`}
              className="block text-sm mb-1"
            >
              Tags (optional)
            </label>
            <TagInput tags={editedTags} setTags={setEditedTags} />
          </div>
          {/* editing the descritpion field */}
          <div>
            <label
              htmlFor={`edit-resourcelink-${todo.id}`}
              className="block text-sm font-medium mb-1"
            >
              Resource Link (optional)
            </label>
            <input
              type="text"
              id={`edit-resourcelink-${todo.id}`}
              value={editedResourceLink}
              onChange={(e) => setEditedResourceLink(e.target.value)}
              className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isUpdating}
            />
          </div>
          <div>
            <label htmlFor={`edit-description-${todo.description}`}>
              Description{" "}
            </label>
            <textarea
              id={`edit-description-${todo.description}`}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full p-2 border "
              disabled={isUpdating}
            />
          </div>
          {/* editing action buttons */}
          <div className="flex  justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="bg-red-700 text-white py-2 px-4 text-sm hover:bg-red-900"
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="bg-green-600 text-white py-2 px-4 text-sm hover:bg-green-800"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  //?-------------------------------------- return the display card when the todocard is not in editing state-==========
  return (
    <>
      {/* Date indicator */}
      <motion.div
        className="absolute -left-5 flex items-center justify-center w-[40px] h-[40px] rounded-full bg-white dark:bg-black shadow-md border-2 border-blue-300 dark:border-gray-400"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Calendar size={20} className="text-blue-400 dark:text-gray-300" />
      </motion.div>

      <div className="relative ml-6 rounded-xl p-4 shadow-sm  hover:shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 group">
        <div className="space-y-4">
          {/* top section of edit delete and tag  */}
          <div className="flex justify-between items-start gap-4">
            {/* left side of the top section  */}
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
          {/* main content title and description */}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-400 leading-tight">
              {todo.title}
            </h3>
            {todo.description && (
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed  break-words whitespace-pre-line">
                {todo.description}
              </p>
            )}
          </div>
          {/* time tracking section */}
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              {/* time display */}
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Time Spent:
                  <span className="font-semibold px-2 py-1 text-green-700 darktext-green-800 bg-green-50 dark:bg-green-900/30">
                    {formatDuration(todo.duration)}
                  </span>
                </p>
              </div>
              {/* time block list of array cirlces */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                  Progress:
                </span>
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
                      className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 ${
                        isActive
                          ? "bg-green-500 border-green-500 shadow-md"
                          : isNext
                          ? "border-green-400 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                          : "border-gray-300 dark:border-gray-600 opacity-40 cursor-not-allowed"
                      }`}
                      aria-label={`${minuteLabel} minute milestone ${
                        isActive ? "completed" : isNext ? "available" : "locked"
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
            {/* action buttons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenModal}
                className="flex items-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                title="Add resources"
              >
                <LinkIcon size={16} />
                <span className="text-xs font-medium hidden sm:inline">
                  Resources
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                title={`${isExpanded ? "Hide" : "Show"} resources`}
                aria-expanded={isExpanded}
              >
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronRight size={16} />
                </motion.div>
                <span className="text-xs font-medium hidden sm:inline">
                  {isExpanded ? "Hide" : "Show"}
                </span>
              </motion.button>
              {/* secondary action buttons */}
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Edit task"
                  title="Edit task details"
                >
                  <Pencil size={16} />
                  <span className="text-xs font-medium">Edit</span>
                </motion.button>
                <DeleteModal onDelete={() => onDeleteTodo(todo.id)} />
              </div>
            </div>
          </div>
          {/* Expandable resources section with improved animation */}
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{
              height: {
                duration: 0.4,
                ease: [0.04, 0.62, 0.23, 0.98],
              },
              opacity: {
                duration: 0.3,
                delay: isExpanded ? 0.1 : 0,
                ease: "easeInOut",
              },
            }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-gray-200">
              <motion.div
                initial={false}
                animate={{
                  y: isExpanded ? 0 : -10,
                  opacity: isExpanded ? 1 : 0,
                }}
                transition={{
                  duration: 0.3,
                  delay: isExpanded ? 0.2 : 0,
                  ease: "easeOut",
                }}
              >
                <h4 className="text-sm font-medium mb-2">Resources</h4>
                {todo.resourceLink ? (
                  <motion.a
                    initial={false}
                    animate={{
                      x: isExpanded ? 0 : -10,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isExpanded ? 0.3 : 0,
                      ease: "easeOut",
                    }}
                    href={todo.resourceLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center"
                  >
                    <Link className="mr-2" size={16} />
                    {todo.resourceLinkTitle || formatUrl(todo.resourceLink)}
                  </motion.a>
                ) : (
                  <motion.p
                    initial={false}
                    animate={{
                      x: isExpanded ? 0 : -10,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: isExpanded ? 0.3 : 0,
                      ease: "easeOut",
                    }}
                    className="text-sm text-gray-500 italic"
                  >
                    No resources added yet
                  </motion.p>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
