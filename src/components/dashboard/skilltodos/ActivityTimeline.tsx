// File: src/components/dashboard/skilltodos/ActivityTimeline.tsx (Create this file)

import { getSkillTasksForSkill } from "@/actions/skillTaskAction"; // Action to fetch tasks
import { skillTodo } from "@/types/skillDashboardTypes";
import {  Clock, ListTodo } from "lucide-react"; // Example icons

interface ActivityTimelineProps {
  skillId: string;
  // Or pass tasks directly if fetched by parent:
  // initialTasks: SkillTodo[];
}

// Helper to format duration (minutes) into a readable string
const formatDuration = (minutes: number): string => {
    if (minutes <= 0) return "0m";
    const totalMinutes = Math.round(minutes); // Ensure integer minutes
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    let result = "";
    if (hours > 0) result += `${hours}h`;
    if (remainingMinutes > 0) result += `${result ? ' ' : ''}${remainingMinutes}m`;
    return result || "0m";
};

// Helper to format ISO date string
const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: 'numeric', // e.g., 2023
        month: 'short',  // e.g., Sep
        day: 'numeric',   // e.g., 29
      });
    } catch {
      return "Invalid Date";
    }
};

// Async component to fetch its own data
export default async function ActivityTimeline({ skillId }: ActivityTimelineProps) {

  // Fetch tasks specifically for this skill when the component renders on the server
  const tasks: skillTodo[] = await getSkillTasksForSkill(skillId);

  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No activity recorded for this skill yet.
      </div>
    );
  }

  // Sort tasks by creation date, newest first (if not already sorted by action)
  const sortedTasks = tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    // Container with max height and scrollbar
    <div className="h-full max-h-[80vh] overflow-y-auto p-1 border rounded-md dark:border-gray-700">
      <h3 className="text-lg font-semibold p-3 sticky top-0 bg-background/90 dark:bg-black/90 backdrop-blur-sm z-10">
          Activity Timeline
      </h3>
      <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3 my-4">
          {/* Map over sorted tasks to create timeline items */}
          {sortedTasks.map((task) => (
              <li key={task.id} className="mb-6 ml-6">
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
                      {task.duration > 0 && ( // Only show duration if tracked
                          <p className="text-sm font-normal text-gray-500 dark:text-gray-400 flex items-center">
                             <Clock size={14} className="mr-1.5" />
                             Duration logged: {formatDuration(task.duration)}
                          </p>
                      )}
                       {/* Optional: Add description or tag info */}
                       {/* {task.description && <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{task.description}</p>} */}
                  </div>
              </li>
          ))}
      </ol>
    </div>
  );
}