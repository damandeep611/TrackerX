"use client";
import { skillTodo } from "@/types/skillDashboardTypes";
import { formatUrl } from "@/utils/format-url";
import { ChevronRight, Link, LinkIcon, Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";
import TagInput from "./tag-input";
import Image from "next/image";
import { motion } from "framer-motion";

interface SkillTodoCardProps {
  todo: skillTodo; //the task data
  //Callbacks to the parent list component
  onUpdateTime: (todoId: string, minutes: number) => void;
  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
  onDeleteTodo: (todoId: string) => void;
  //optional props to indicate loading states controlled by the parent component
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export default function SkillTodoCard({
  todo,
  onUpdateTime,
  onEditTodo,
  onDeleteTodo,
  isUpdating = false,
  isDeleting = false,
}: SkillTodoCardProps) {
  // state management for local states
  const [isEditing, setIsEditing] = useState(false); //isEditing controls whether the card shows the display view or editing form
  //state variables to hold the edited values while the form is active
  // initialize with current todo values when editing starts
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [editedResourceLink, setEditedResourceLink] = useState(
    todo.resourceLink || ""
  );
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
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const reamainingMinutes = minutes % 60;
    return reamainingMinutes > 0
      ? `${hours}h ${reamainingMinutes}m`
      : `${hours}h`;
  };

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
  // ! fix this layout and refactor this ui card to be more compact and also use react query to move the db fn
  return (
    <>
      <Image
        src="/calendar.png"
        alt="calender"
        width={20}
        height={20}
        className="absolute -left-2 mt-4"
      />

      <div className=" relative ml-4 rounded-lg p-4 shadow-sm hover:shadow-md border border-border transition-shadow">
        <div className="space-y-4">
          {/* top section of edit delete and tag  */}
          <div className="flex justify-between items-start">
            {/* left side of the top section  */}
            <div className="flex items-center space-x-2">
              {todo.tags && todo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {todo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-500 text-xs rounded-md capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs text-gray-500">
                {formatDate(todo.date)}
              </span>
            </div>
            {/* right side of edit and delete button */}
          </div>
          {/* main content title and description */}
          <div>
            <h3 className=" text-lg dark:text-gray-400">{todo.title}</h3>
            {todo.description && (
              <p className="text-sm  mt-1 break-words whitespace-pre-line">
                {todo.description}
              </p>
            )}
            {todo.resourceLink && (
              <div className="mt-2">
                <a
                  href={todo.resourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-800 hover:underline flex items-center"
                >
                  <Link />
                  {formatUrl(todo.resourceLink)}
                </a>
              </div>
            )}
          </div>
          {/* time tracking section */}
          <div className="flex items-center justify-between">
            {/* display format duration */}
            <div className="space-y-3">
              <div>
                <p className="text-sm ">
                  Time Spent:
                  <span className="font-medium px-2 text-green-800">
                    {formatDuration(todo.duration)}
                  </span>
                </p>
              </div>
              {/* time block list of array cirlces */}
              <div className="flex items-center space-x-2 ">
                {[...Array(5)].map((_, index) => {
                  const isActive = todo.duration >= (index + 1) * 30;
                  const isNext = todo.duration === index * 30;
                  return (
                    <button
                      key={index}
                      onClick={() => handleTimeBlockClick(index)}
                      disabled={
                        isUpdating || isDeleting || (!isActive && !isNext)
                      }
                      className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                        isActive
                          ? "bg-green-500 border-green-500 shadow-sm"
                          : isNext
                          ? "border-green-300 hover:border-green-500"
                          : "border-gray-400 opacity-50 cursor-not-allowed"
                      }`}
                      aria-label={`${(index + 1) * 30} minute block`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <motion.button
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer bg-gray-200 dark:bg-gray-800 p-2 rounded-md"
                title="click to add resources"
              >
                <LinkIcon size={18} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer bg-gray-200 dark:bg-gray-800 p-2 rounded-md"
                title="Open added links"
              >
                <ChevronRight size={18} />
              </motion.button>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleEdit}
                  className="p-1 hover:text-blue-500"
                  aria-label="Edit task"
                  disabled={isUpdating}
                  title="Edit Task details"
                >
                  <Pencil size={16} color="gray" className="cursor-pointer" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.3 }}
                  onClick={() => onDeleteTodo(todo.id)}
                  className=" cursor-pointer  bg-red-200 dark:bg-red-300 hover:bg-red-600   p-2 rounded-md"
                  aria-label="Delete task"
                  disabled={isUpdating || isDeleting}
                  title="Delete Task"
                >
                  <Trash2
                    size={16}
                    className="text-red-500 hover:text-red-200 transition-colors "
                  />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
