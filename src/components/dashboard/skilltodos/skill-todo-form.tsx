"use client";
import { newSkillTodo } from "@/types/skillDashboardTypes";
import { Send } from "lucide-react";
import React, { ChangeEvent, useState } from "react";
import TagInput from "./tag-input";
import { motion } from "framer-motion";
import { useRecentTags } from "@/hooks/useRecentTags";

//defining the props expected by the skilltodoform component
interface SkillTodoFormProps {
  onAddSkillTodo: (todo: Omit<newSkillTodo, "skillId">) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  skillId: string;
  initialValues?: Partial<newSkillTodo>; // Added for edit mode
}

export default function SkillTodoForm({
  onAddSkillTodo,
  onCancel,
  isSubmitting = false,
  skillId,
  initialValues,
}: SkillTodoFormProps) {
  // use of react hooks and using local state to define the value of form inputs
  const [title, setTitle] = useState(initialValues?.title || "");
  const [description, setDescription] = useState(
    initialValues?.description || "",
  );
  const [tags, setTags] = useState<string[]>(initialValues?.tags || []);
  //and local state to manage and display the validation error for the form
  const [validationError, setValidationError] = useState("");

  // Fetch recent tags for suggestions
  const { recentTags } = useRecentTags(skillId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //client side validation to ensure the title is not empty or blank whitespace
    if (!title.trim()) {
      setValidationError("Task name is required");
      return; //stop submission if validation fails
    }
    // --call parent handler to pass the collected data up to the parent component
    onAddSkillTodo({
      title: title.trim(),
      description: description.trim() || null,
      done: initialValues?.done || false,
      tags: tags,
      status: initialValues?.status, // Preserve status if editing
    });

    // Only reset if NOT editing (adding new task)
    if (!initialValues) {
      setTitle("");
      setDescription("");
      setTags([]);
    }
  };

  //handle input change and clear validation error on typing
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  const isEditing = !!initialValues;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Input */}
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Task Name
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={handleTitleChange}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            validationError ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
          placeholder="What needs to be done?"
          aria-required="true"
          aria-invalid={!!validationError}
          disabled={isSubmitting}
          autoFocus
        />
        {validationError && (
          <p className="text-xs text-red-500">{validationError}</p>
        )}
      </div>

      {/* Tag Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">Tags</label>
        <TagInput tags={tags} setTags={setTags} suggestions={recentTags} />
      </div>

      {/* Description Input */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium leading-none"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this task..."
          className="flex min-h-25 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          disabled={isSubmitting}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!title.trim() || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Add Task"}
        </motion.button>
      </div>
    </form>
  );
}
