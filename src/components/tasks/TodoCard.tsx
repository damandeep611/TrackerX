"use client"
import { Todo } from "@/types/todoTypes";
import { Check, Pencil, Trash, X } from "lucide-react";
import React, { useState } from "react";

interface TodoCardProps {
  todo: Todo; //the task data to display
  onUpdateTime: (todoId: string, minutes: number) => void; //function to call when the time is updated
  onEditTodo: (todoId: string, updatedTodo: Partial<Todo>) => void; // to call when the task is saved after editing
  onDeleteTodo: (todoId: string) => void; //when deleting the task
  //props to manage ui changes and show the loading states
  isUpdating?: boolean; // is an update/edit operation in progress for the task
  isDeleting?: boolean;
}

export default function TodoCard({
  todo,
  onUpdateTime,
  onEditTodo,
  onDeleteTodo,
  isUpdating = false,
  isDeleting = false,
}: TodoCardProps) {
  const [isEditing, setIsEditing] = useState(false); // to control whether the card shows the display view or the edit task form
  //state variables to hold the edited values  while the form is active and holding initial todo values
  const [editedTitle, setEditedTitle] = useState(todo.title); //
  const [editedDescription, setEditedDescription] = useState(
    todo.description || ""
  );
  const [editedTag, setEditedTag] = useState(todo.tag || "");
  const [validationError, setValidationError] = useState(""); // to show validation errors within the edit form

  // -----------event handling
  //function trigger when the time block button is clicked
  const handleTimeBlockClick = (blockIndex: number) => {
    //calculate the duration in minutes based on the clicked block
    const targetMinutes = (blockIndex + 1) * 30;

    //update time, if clicking next unfillled block or already filled block to "reset" back to that point, logic needs refinement
    if (
      targetMinutes === todo.duration + 30 ||
      (targetMinutes < todo.duration && targetMinutes + 30 > todo.duration)
    ) {
      //call the callback prop passed from TodoList to handle the actual update logic
      onUpdateTime(todo.id, targetMinutes);
    }
  };

  //function triggered when the "Edit button is clicked"
  const handleEdit = () => {
    setIsEditing(true); //set the component state to switch to edit mode
    setEditedTitle(todo.title); //intiate the edit with current task form data
    setEditedDescription(todo.description || "");
    setEditedTag(todo.tag || "");
    setValidationError(""); //clear any previous validation errors
  };

  //triggered when the "cancel" button in the edit form is clicked
  const handleCancelEdit = () => {
    //set the component state back to display mode
    setIsEditing(false);
    setValidationError(""); //clear validation errors
  };

  // edited input validation  and saving the edited data
  const handleSaveEdit = () => {
    if (!editedTitle.trim()) {
      setValidationError("Title is required");
      return; // stop saving if validation fails
    }
    // todoList will handle the server action by drilling onEditTodo function
    onEditTodo(todo.id, {
      title: editedTitle.trim(),
      description: editedDescription.trim() || null,
      tag: editedTag.trim() || null,
    });
    //switch back to dispaly card mode after saving
    setIsEditing(false);
    setValidationError("");
  };

  // --------------time duration Format helper function into readable format i.e "1h 30 min"
  const formatDuration = (minutes: number): string => {
    if (minutes === 0) return "0m";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  };

  //format and ISO date string into a locale-specific short date format e.g wed apr 27
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      //using browser's inbuild date formatting
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      const dateError = String(error);
      return dateError;
    }
  };

  // if 'isEditing' state is true, render the edit form
  if (isEditing) {
    return (
      <div className=" rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="space-y-3">
          <div>
            <label
              htmlFor={`edit-title-${todo.id}`}
              className="block text-sm font-medium  mb-1"
            >
              Task Title<span className="text-red-500">*</span>
            </label>
            <input
              id={`edit-title-${todo.id}`}
              type="text"
              value={editedTitle}
              onChange={(e) => {
                setEditedTitle(e.target.value);
                if (validationError) setValidationError("");
              }}
              className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationError ? "border-red-500" : ""
              }`}
              disabled={isUpdating}
              autoFocus
            />
            {validationError && (
              <p className="text-red-500 text-xs mt-1">{validationError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor={`edit-tag-${todo.id}`}
              className="block text-sm font-medium  mb-1"
            >
              Tag (optional)
            </label>
            <input
              id={`edit-tag-${todo.id}`}
              type="text"
              value={editedTag}
              onChange={(e) => setEditedTag(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUpdating}
            />
          </div>

          <div>
            <label
              htmlFor={`edit-description-${todo.id}`}
              className="block text-sm font-medium  mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id={`edit-description-${todo.id}`}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y max-h-[300px]"
              disabled={isUpdating}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="flex items-center px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isUpdating}
            >
              <X size={16} className="mr-1" />
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              disabled={isUpdating}
            >
              <Check size={16} className="mr-1" />
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className=" rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            {todo.tag && (
              <span className="px-2 py-1 text-xs bg-blue-100 rounded-md text-blue-600 capitalize">
                {todo.tag}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {formatDate(todo.date)}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="p-1  hover:text-blue-500 transition-colors"
              aria-label="Edit task"
              disabled={isUpdating || isDeleting}
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDeleteTodo(todo.id)}
              className="p-1  hover:text-red-500 transition-colors"
              aria-label="Delete task"
              disabled={isUpdating || isDeleting}
            >
              <Trash size={16} />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">{todo.title}</h3>
          {todo.description && (
            <p className="text-sm  mt-1 break-words whitespace-pre-line">
              {todo.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {/* Time tracking section */}
          <div>
            <p className="text-sm ">
              Tracked Time:{" "}
              <span className="font-medium">
                {formatDuration(todo.duration)}
              </span>
            </p>
          </div>

          {/* Time blocks */}
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, index) => {
              const isActive = todo.duration >= (index + 1) * 30;
              const isNext = todo.duration === index * 30;

              return (
                <button
                  key={index}
                  onClick={() => handleTimeBlockClick(index)}
                  disabled={isUpdating || isDeleting || (!isActive && !isNext)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all duration-200
                    ${
                      isActive
                        ? "bg-green-500 border-green-500 shadow-sm"
                        : isNext
                        ? "border-green-300 hover:border-green-500"
                        : "border-gray-200 opacity-50 cursor-not-allowed"
                    }
                  `}
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
