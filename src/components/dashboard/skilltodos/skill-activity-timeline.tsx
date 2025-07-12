"use client"
import { skillTodo } from '@/types/skillDashboardTypes'
import { Clock, ListTodo, X } from "lucide-react";
import React, { useState } from "react";

interface SkillActivityTimelineProps {
  fetchTasks?: skillTodo[];
}

// Helper to format duration (minutes) into a readable string


// Helper to format ISO date string
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", // e.g., 2023
      month: "short", // e.g., Sep
      day: "numeric", // e.g., 29
    });
  } catch {
    return "Invalid Date";
  }
};

export default function SkillActivityTimeline({
  fetchTasks,
}: SkillActivityTimelineProps) {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <button
        onClick={togglePanel}
        className=" bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-md transition-colors duration-200 flex items-center gap-2 cursor-pointer"
      >
        <Clock size={18} />
        Activity Timeline
      </button>
      {/* overlay */}
      <div
        onClick={togglePanel}
        className={`fixed inset-0  backdrop-blur-xs z-30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-90 invisible"
        }`}
      />
      {/* sidepanel */}
      <div
        className={`fixed  top-0 right-0 h-full w-full sm:w-96 shadow-lg z-40  overflow-y-auto transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } `}
      >
        <div className="p-4 ">
          <button
            onClick={togglePanel}
            className="absolute cursor-pointer top-4 right-4 text-gray-500 z-50"
          >
            <X />
          </button>
          <span className="p-2 ">Activity Timeline</span>
          <div className="relative pl-4 pt-4 border-l border-gray-200">
            {fetchTasks?.map((task) => (
              <li key={task.id} className="mb-6 ml-6 list-none">
                {/* Timeline Item Dot and Icon */}
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-4 ring-white dark:ring-gray-900 dark:bg-blue-900">
                  {/* Choose icon based on activity type if possible, otherwise default */}
                  <ListTodo className="w-3 h-3 text-blue-800 dark:text-blue-300" />
                </span>
                {/* Timeline Item Content */}
                <div className="ml-2 p-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                  {/* Task Title */}
                  <h4 className="flex items-center mb-1 text-md font-semibold text-gray-900 dark:text-white">
                    Task Added: {task.title}
                    {/* Optional: Add badge for completion later */}
                    {/* <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300 ms-3">Latest</span> */}
                  </h4>
                  {/* Creation Date */}
                  <time className="block mb-2 text-xs font-normal leading-none text-gray-400 dark:text-gray-500">
                    Created on {formatDate(task.createdAt)}
                  </time>
                  {/* Duration Recorded */}

                  {/* Optional: Add description or tag info */}
                  {/* {task.description && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{task.description}</p>} */}
                </div>
              </li>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
