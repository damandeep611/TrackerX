"use client";
import { skillTodo } from "@/types/skillDashboardTypes";
import { Pencil, Trash } from "lucide-react";
import React, { useState } from "react";

interface SkillTodoCardProps {
  todo: skillTodo;
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
  const [editedDescription, setEditedDescription] = useState(
    todo.description || ""
  );
  const [editedTag, setEditedTag] = useState(todo.tag || "");
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
    setEditedDescription(todo.description || "");
    setEditedTag(todo.tag || "");
    setValidationError("");
  };

  const handleCancelEdit = ()=> {
    setIsEditing(false);
    setValidationError("")
  }

  const handleSaveEdit = () => {
    if (!editedTitle.trim()) {
      setValidationError("Title is required");
      return;
    }
    onEditTodo(todo.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim() || null,
      tag: editedTag.trim() || null,
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
      <div className="rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-3">
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
              htmlFor={`edit-tag-${todo.id}`}
              className="block text-sm mb-1"
            >
              Tag (optional)
            </label>
            <input
              type="text"
              id={`edit-tag-${todo.id}`}
              value={editedTag}
              onChange={(e) => setEditedTag(e.target.value)}
              disabled={isUpdating}
              className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {/* editing the descritpion field */}
          <div>
            <label
              htmlFor={`edit-description-${todo.id}`}
              className="block text-sm font-medium mb-1"
            >
              Description (optional)
            </label>
            <input
              type="text"
              id={`edit-description-${todo.id}`}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-green-500"
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
  // return the display card when the todocard is not in editing state
  return (
    <div className="rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        {/* top section of edit delete and tag  */}
        <div className="flex justify-between items-start">
          {/* left side of the top section  */}
          <div className="flex items-center space-x-2">
            {todo.tag && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md capitalize">
                {todo.tag}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDate(todo.date)}
            </span>
          </div>
          {/* right side of edit and delete button */}
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-1 hover:text-blue-500"
              aria-label="Edit task"
              disabled={isUpdating}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDeleteTodo(todo.id)}
              className="p-1 hover:text-red-500"
              aria-label="Delete task"
              disabled={isUpdating || isDeleting}
            >
              <Trash size={16} />
            </button>
          </div>
        </div>
        {/* main content title and description */}
        <div>
          <h3 className="text-lg font-semibold">{todo.title}</h3>
          {todo.description && (
            <p className="text-sm mt-1 break-words whitespace-pre-line">
              {todo.description}
            </p>
          )}
        </div>
        {/* time tracking section */}
        <div className="space-y-3">
          {/* display format duration */}
          <div>
            <p className="text-sm">
              Tracked Time:{" "}
              <span className="font-medium">
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
                  disabled={isUpdating || isDeleting || (!isActive && !isNext)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    isActive
                      ? "bg-green-500 border-green-500 shadow-sm"
                      : isNext
                      ? "border-green-300 hover:border-green-500"
                      : "border-gray-200 opacity-50 cursor-not-allowed"
                  }`}
                  aria-label={`${(index + 1) * 30} minute block`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
