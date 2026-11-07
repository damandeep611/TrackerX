"use client"
import { skillTodo } from "@/types/skillDashboardTypes";
import SkillTodoForm from "./skill-todo-form";
import SkillTodoCard from "./skill-todo-card";
import { motion, AnimatePresence } from "motion/react";
import { taskCardVariants } from "@/components/animations/taskCardAnimations";
import { useSkillTodoManager } from "@/hooks/useSkillTodoManager";
import { getTotalTimeForTasks } from "@/actions/timeLogAction";
import { useEffect, useState } from "react";
import { ClipboardList, Plus } from "lucide-react";

import Modal from "@/components/ui/modal";

interface SkillTodoListProps {
  initialSkillTodos?: skillTodo[];
  skillId: string;
  onTimeUpdate?: () => void; // Callback to refresh analytics data
}

export default function SkillTodoList({
  initialSkillTodos = [],
  skillId,
  onTimeUpdate,
}: SkillTodoListProps) {
  const [timeData, setTimeData] = useState<Record<string, number>>({});
  const [isLoadingTimeData, setIsLoadingTimeData] = useState(false);

  // Function to refresh time data for a specific task only
  const refreshTimeDataForTask = async (taskId: string) => {
    setIsLoadingTimeData(true);
    try {
      const timeMap = await getTotalTimeForTasks([taskId]);
      setTimeData((prev) => ({
        ...prev,
        ...timeMap,
      }));
    } catch (error) {
      console.error("Failed to refresh time data for task:", error);
    } finally {
      setIsLoadingTimeData(false);
    }
  };

  // Function to refresh time data (can be called after time updates)
  const refreshTimeData = async (skillTodos: skillTodo[]) => {
    if (skillTodos.length === 0) return;

    setIsLoadingTimeData(true);
    try {
      const taskIds = skillTodos.map((todo) => todo.id);
      const timeMap = await getTotalTimeForTasks(taskIds);
      setTimeData(timeMap);
    } catch (error) {
      console.error("Failed to refresh time data:", error);
    } finally {
      setIsLoadingTimeData(false);
    }
  };

  const {
    //states
    skillTodos,
    isAddingTodo,

    updatingTodoId,
    deletingTodoId,
    isSubmittingForm,

    //actions state
    setIsAddingTodo,
    handleAddTodo,

    handleEditTodo,
    handleToggleTodo,

    handleDeleteTodo,
  } = useSkillTodoManager({
    initialSkillTodos,
    skillId,
    onTimeUpdate,
    onRefreshTimeData: () => refreshTimeData(skillTodos),
  });

  // Load time data for all tasks at once
  useEffect(() => {
    if (skillTodos.length === 0) return;

    let isMounted = true;

    const loadTimeData = async () => {
      if (isMounted) {
        setIsLoadingTimeData(true);
      }

      try {
        const taskIds = skillTodos.map((todo) => todo.id);
        const timeMap = await getTotalTimeForTasks(taskIds);
        if (isMounted) {
          setTimeData(timeMap);
        }
      } catch (error) {
        console.error("Failed to load time data:", error);
      } finally {
        if (isMounted) {
          setIsLoadingTimeData(false);
        }
      }
    };

    loadTimeData();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [skillTodos]); // Re-run if skillTodos array changes

  // State for tab selection
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "completed"
  >("all");

  // Filtered todos based on selected tab
  const filteredSkillTodos = skillTodos.filter((todo) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "pending") return !todo.done;
    if (selectedTab === "completed") return todo.done;
    return true;
  });

  // Pagination state
  const TASKS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page to 1 when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTab]);

  // Calculate pagination
  const totalTasks = filteredSkillTodos.length;
  const totalPages = Math.ceil(totalTasks / TASKS_PER_PAGE);
  const paginatedTodos = filteredSkillTodos.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE,
  );

  return (
    <div className=" mx-10 ">
      <Modal
        isOpen={isAddingTodo}
        onClose={() => setIsAddingTodo(false)}
        title="Create New Task"
      >
        <SkillTodoForm
          onAddSkillTodo={handleAddTodo}
          onCancel={() => setIsAddingTodo(false)}
          isSubmitting={isSubmittingForm}
          skillId={skillId}
        />
      </Modal>

      {/* to show the tasks if there are any and showing no tasks title if there are 0 tasks */}
      {skillTodos.length === 0 ? (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsAddingTodo(true)}
              className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-black/5"
            >
              <Plus size={14} />
              <span>New Task</span>
            </button>
          </div>
          <p>No tasks added yet , add to get started</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            {/* Tabs for filtering */}
            <div className="p-4 flex items-center justify-between">
              <div
                className="flex items-center gap-1 bg-surface-highlight/50 p-1 rounded-lg border border-border"
                role="tablist"
                aria-label="Task filter tabs"
              >
                {[
                  { label: "All", value: "all" },
                  { label: "Pending", value: "pending" },
                  { label: "Completed", value: "completed" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    role="tab"
                    aria-selected={selectedTab === tab.value}
                    tabIndex={selectedTab === tab.value ? 0 : -1}
                    onClick={() =>
                      setSelectedTab(tab.value as typeof selectedTab)
                    }
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all
                      ${
                        selectedTab === tab.value
                          ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/5"
                          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            {/* show todo form only when isAdding state is true */}
            <div className="flex items-center justify-between  gap-3">
              <button
                onClick={() => setIsAddingTodo(true)}
                className="flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-black/5"
              >
                <Plus size={14} />
                <span>New Task</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
                <button className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                  <ClipboardList size={14} />
                  {skillTodos.length} Total
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            {/* --------------------------timeline line--------------- */}
            <motion.div
              className="absolute   top-0 bottom-0 w-px bg-linear-to-b from-zinc-200 to-zinc-300 dark:from-gray-500 dark:to-gray-500 rounded-full "
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.5 }}
            />
            <div className="space-y-8 my-6 mx-2">
              <AnimatePresence mode="popLayout">
                {paginatedTodos.map((skillTodo) => (
                  <motion.div
                    key={skillTodo.id}
                    variants={taskCardVariants}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <SkillTodoCard
                      todo={skillTodo}
                      timeLogMinutes={timeData[skillTodo.id] || 0}
                      isLoadingTime={isLoadingTimeData}
                      onEditTodo={handleEditTodo}
                      onDeleteTodo={handleDeleteTodo}
                      toggleIsdone={handleToggleTodo}
                      isUpdating={updatingTodoId === skillTodo.id}
                      isDeleting={deletingTodoId === skillTodo.id}
                      onTimeLogCreated={() =>
                        refreshTimeDataForTask(skillTodo.id)
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div
                  className="flex items-center justify-center mt-8 space-x-4"
                  aria-label="Pagination Navigation"
                >
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium transition-colors
                      ${
                        currentPage === 1
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }
                    `}
                    aria-label="Previous Page"
                  >
                    Previous
                  </button>
                  <span className="text-zinc-700 dark:text-zinc-200 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium transition-colors
                      ${
                        currentPage === totalPages
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }
                    `}
                    aria-label="Next Page"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
