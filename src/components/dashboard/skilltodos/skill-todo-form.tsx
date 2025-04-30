"use client";
import { newSkillTodo } from "@/types/skillDashboardTypes";
import React, { useState } from "react";

//defining the props expected by the skilltodoform component
//these are the callback props as they will be passed functions from parent component of TodoList
interface SkillTodoFormProps {
  onAddSkillTodo: (todo: Omit<newSkillTodo, "skillId">) => void; //function to call when the form is submitted successfully
  onCancel: () => void; //function to call when the cancel button is clicked
  isSubmitting?: boolean; //optional prop to indicate if the parent component is currently processing the submission
}
//and after we have made the props to pass to the functional component i. SkillTodoForm we will destructure the props
// and with destructuring we will pass default value for isSubmitting
export default function SkillTodoForm({
  onAddSkillTodo,
  onCancel,
  isSubmitting = false,
}: SkillTodoFormProps) {
  // use of react hooks and using local state to define the value of form inputs
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  //and local state to manage and display the validation error for the form
  const [validationError, setValidationError] = useState("");

  // event handlers and calling this function when the submit button is clicked

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //client side validation to ensure the title is not empty or blank whitespace
    if (!title.trim()) {
      setValidationError("Task name is required");
      return; //stop submission if validation fails
    }
    onAddSkillTodo({
      title: title.trim(),
      description: description.trim() || null,
      tag: tag.trim() || null,
    });
    setTitle("");
    setDescription("");
    setTag("");
    setValidationError("");
  };
  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* task title input field */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
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
            className={`w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationError ? "border-red-500" : ""
            }`}
            placeholder="Add task for the skill"
            aria-required="true"
            aria-invalid={!!validationError}
            disabled={isSubmitting}
            autoFocus
          />
          {validationError && (
            <span className="text-red-500 text-xs mt-1">{validationError}</span>
          )}
        </div>
        {/* tag input field */}
        <div>
          <label htmlFor="tag" className="block text-sm font-medium">
            Tag (optional)
          </label>
          <input
            type="text"
            id="tag"
            value={tag}
            placeholder="Tags are optional to identify sorting of tasks"
            onChange={(e) => setTag(e.target.value)}
            className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>
        {/* description input field */}
        <div>
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            className="w-full p-2 border focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        {/* form buttons */}
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-4 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 text-sm bg-blue-500 text-white hover:bg-blue-800 rounded-lg"
          >
            {isSubmitting ? "adding..." : "Add Task"}
          </button>
        </div>
      </form>
    </div>
  );
}
