"use client";
import { newSkillTodo } from "@/types/skillDashboardTypes";
import { Send } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import TagInput from "./tag-input";
import { motion } from "framer-motion";

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
  // expanding the form
  const [isExpanded, setIsExpanded] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  // use of react hooks and using local state to define the value of form inputs
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [resourceLink, setResourceLink] = useState("");
  //and local state to manage and display the validation error for the form
  const [validationError, setValidationError] = useState("");

  const handleTaskFormExpanded = () => {
    setIsExpanded(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 100);
  };

  const handleTaskFormCollapse = () => {
    setIsExpanded(false);
    setTitle("");
    setResourceLink("");
    setTags([]);
    setValidationError("");
    onCancel();
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    //client side validation to ensure the title is not empty or blank whitespace
    if (!title.trim()) {
      setValidationError("Task name is required");
      return; //stop submission if validation fails
    }
    // --call parent handler to pass the collected data up to the parent component
    //so that parent component can add the skillId before calling the server action
    onAddSkillTodo({
      title: title.trim(),
      resourceLink: resourceLink.trim() || null,
      tags: tags,
    });
    // reset form after submission
    handleTaskFormCollapse();
  };

  //handle input change and clear validation error on typing
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };
  return (
    <div className=" flex justify-center items-end ">
      <div className="w-full  mx-auto ">
        <motion.form
          onSubmit={handleSubmit}
          className=" mb-8 border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          animate={{
            boxShadow: isExpanded
              ? "0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
              : "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          }}
          transition={{ duration: 0.2 }}
        >
          {/* main input bar - visible always */}
          <div className=" relative  ">
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              onClick={!isExpanded ? handleTaskFormExpanded : undefined}
              className={`flex-1 relative  p-3  rounded-lg focus:outline-none  w-full  ${
                validationError ? "border-red-500" : ""
              }`}
              placeholder="Add task for the skill"
              aria-required="true"
              aria-invalid={!!validationError}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          {/* Expanded section */}
          <motion.div
            initial={false}
            animate={{
              height: isExpanded ? "auto" : 0,
              opacity: isExpanded ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border">
              {/* tag input field */}
              <div>
                <TagInput tags={tags} setTags={setTags} />
              </div>
              {/* description input field */}
              <div>
                <input
                  id="resourceLink"
                  className="w-full px-3 py-2  border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/resource add link here "
                  value={resourceLink}
                  onChange={(e) => setResourceLink(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 m-2">
              <motion.button
                onClick={handleTaskFormCollapse}
                className="cursor-pointer"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={!title.trim()}
                className="px-4 py-2 cursor-pointer  text-white bg-blue-700 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "adding..." : "Add Task"}
              </motion.button>
            </div>
          </motion.div>

          {/* Expandable drawer containing tag and description field */}
        </motion.form>
      </div>
    </div>
  );
}
