"use client"
import { NewTodo } from "@/types/todoTypes";
import React, { useState } from "react";

interface TodoFormProps {
  onAddTodo: (todo: NewTodo) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function TodoForm({
  onAddTodo,
  onCancel,
  isSubmitting = false,
}: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e:React.FormEvent)=> {
    e.preventDefault();
    //validate input
    if(!title.trim()){
      setValidationError("Title is required");
      return;
    }
    onAddTodo({
      title: title.trim(),
      description: description.trim() || null,
      tag: tag.trim() || null
    })
    //reset form 
    setTitle("");
    setDescription("");
    setTag("");
    setValidationError("")
  }
  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Task Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError("");
            }}
            placeholder="What needs to be done"
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-50 ${
              validationError ? "border-red-500" : ""
            }`}
            aria-required="true"
            aria-invalid={!!validationError}
            disabled={isSubmitting}
            autoFocus
          />
          {validationError && (
            <p className="text-red-500 text-xs mt-1">{validationError}</p>
          )}
        </div>
        {/* tag input field */}
        <div>
          <label
            htmlFor="tag"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tag(optional)
          </label>
          <input
            type="text"
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="e.g., Work Personal, Study"
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        {/* description input field */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium ">
            Description (optional)
          </label>
          <input
            type="text"
            id="description"
            placeholder="Add more details about this task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-900 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-900 transition-colors disabled:bg-blue-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding...." : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
