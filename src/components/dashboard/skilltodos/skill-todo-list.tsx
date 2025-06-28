"use client"
import { skillTodo } from "@/types/skillDashboardTypes";
import SkillTodoForm from "./skill-todo-form";
import SkillTodoCard from "./skill-todo-card";
import ResourceModal from "./resource-modal";
import { motion } from "framer-motion";
import { taskCardContainerVariants } from "@/components/animations/taskCardAnimations";
import { useSkillTodoManager } from "@/hooks/useSkillTodoManager";

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
    handleUpdateTime,
    handleEditTodo,
    handleToggleTodo,
    handleAddResource,
    handleDeleteTodo,
    handleCloseResourceModal,
    handleOpenResourceModal,
  } = useSkillTodoManager({ initialSkillTodos, skillId, onTimeUpdate });
  return (
    <div className="container mx-auto max-w-4xl p-4 ">
      <div>
        {/* show todo form only when isAdding state is true */}

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
        <div className="relative ">
          {/* timeline line */}
          <motion.div
            className="absolute   top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-500 dark:from-gray-500 dark:to-gray-500 rounded-full "
            initial={{ height: 0 }}
            animate={{ height: "100%" }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            className="space-y-8 my-6 "
            variants={taskCardContainerVariants}
            initial="hidden"
            animate="show"
          >
            {skillTodos.map((skillTodo) => (
              <SkillTodoCard
                key={skillTodo.id}
                todo={skillTodo}
                onUpdateTime={handleUpdateTime}
                onEditTodo={handleEditTodo}
                onDeleteTodo={handleDeleteTodo}
                toggleIsdone={handleToggleTodo}
                onOpenModal={() => handleOpenResourceModal(skillTodo.id)}
                isUpdating={updatingTodoId === skillTodo.id}
                isDeleting={deletingTodoId === skillTodo.id}
              />
            ))}
            {showResourceModal && (
              <ResourceModal
                onClose={handleCloseResourceModal}
                onAddResource={handleAddResource}
                isSubmitting={isAddingResource}
              />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
