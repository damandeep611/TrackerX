"use client"
import { skillTodo } from "@/types/skillDashboardTypes";
import SkillTodoForm from "./skill-todo-form";
import SkillTodoCard from "./skill-todo-card";
import ResourceModal from "./resource-modal";
import { motion, AnimatePresence } from "framer-motion";
import { taskCardVariants } from "@/components/animations/taskCardAnimations";
import { useSkillTodoManager } from "@/hooks/useSkillTodoManager";
import { getTotalTimeForTasks } from "@/actions/timeLogAction";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

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
    isPending,
    updatingTodoId,
    deletingTodoId,
    isSubmittingForm,
    showResourceModal,

    isAddingResource,
    //actions state
    setIsAddingTodo,
    handleAddTodo,

    handleEditTodo,
    handleToggleTodo,
    handleAddResource,
    handleDeleteTodo,
    handleCloseResourceModal,
    handleOpenResourceModal,
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
    currentPage * TASKS_PER_PAGE
  );

  return (
    <div className=" mx-10 ">
      <div>
        {/* show todo form only when isAdding state is true */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Tasks</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400 border border-white/5">
                {skillTodos.length} Total
              </span>
            </div>
          </div>
          <button className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-neutral-200 transition-colors">
            <Plus size={16} className={`transition-transform duration-300 `} />
            <span>New Task</span>
          </button>
        </div>
        <div className={`relative   ${isAddingTodo ? "border-green-600" : ""}`}>
          <SkillTodoForm
            onAddSkillTodo={handleAddTodo}
            onCancel={() => setIsAddingTodo(false)}
            isSubmitting={isSubmittingForm}
          />
        </div>
      </div>

      {/* to show the tasks if there are any and showing no tasks title if there are 0 tasks */}
      {skillTodos.length === 0 && !isPending ? (
        <div>
          <p>No tasks added yet , add to get started</p>
        </div>
      ) : (
        <>
          <div>
            {/* Tabs for filtering */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 mb-2 w-full">
              <div
                className="flex flex-wrap gap-2"
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
                    className={`px-4 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 text-xs font-semibold shadow-sm
                      ${
                        selectedTab === tab.value
                          ? "bg-green-600 text-white shadow-md border border-green-700"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-green-100 dark:hover:bg-green-900 border border-transparent"
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative">
            <motion.div
              className="absolute   top-0 bottom-0 w-0.5 bg-gradient-to-b from-zinc-200 to-zinc-300 dark:from-gray-500 dark:to-gray-500 rounded-full "
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
                      onOpenModal={() => handleOpenResourceModal(skillTodo.id)}
                      isUpdating={updatingTodoId === skillTodo.id}
                      isDeleting={deletingTodoId === skillTodo.id}
                      onTimeLogCreated={() =>
                        refreshTimeDataForTask(skillTodo.id)
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {showResourceModal && (
                <ResourceModal
                  onClose={handleCloseResourceModal}
                  onAddResource={handleAddResource}
                  isSubmitting={isAddingResource}
                />
              )}
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
