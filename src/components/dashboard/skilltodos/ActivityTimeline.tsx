import { getSkillTasksForSkill } from "@/actions/skillTaskAction"; // Action to fetch tasks
import { skillTodo } from "@/types/skillDashboardTypes";
import SkillActivityTimeline from "./skill-activity-timeline";

interface ActivityTimelineProps {
  skillId: string;
  // initialTasks: SkillTodo[];
}

// Async component to fetch its own data
export default async function ActivityTimeline({
  skillId,
}: ActivityTimelineProps) {
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
  const sortedTasks = tasks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    // Container with max height and scrollbar
    <div className="">
      {/* Map over sorted tasks to create timeline items */}
      <SkillActivityTimeline fetchTasks={sortedTasks} />
    </div>
  );
}
