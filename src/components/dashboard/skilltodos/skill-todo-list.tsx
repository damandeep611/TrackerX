"use client"
import { newSkillTodo, skillTodo } from "@/types/skillDashboardTypes";
import React, { useState, useTransition } from "react";
import SkillTodoForm from "./skill-todo-form";
import SkillTodoCard from "./skill-todo-card";
import {
  addSkillTasks,
  deleteSkillTask,
  editSkillTask,
  toggleTaskDone,
  updateskillTaskTime,
  updateTaskResource,
} from "@/actions/skillTaskAction";
import ResourceModal from "./resource-modal";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { taskCardContainerVariants } from "@/components/animations/taskCardAnimations";

interface SkillTodoListProps {
  initialSkillTodos?: skillTodo[];
  skillId: string;
  skillSlug: string;
}

// !use uuid instead of this temporary id
const generateTempId = (): string => {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`; // [cite: 109]
};

export default function SkillTodoList({
  initialSkillTodos = [],
  skillId,
  skillSlug,
}: SkillTodoListProps) {
  const [skillTodos, setSkillTodos] = useState<skillTodo[]>(initialSkillTodos);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [isAddingResource, setIsAddingResource] = useState(false);

  // event handlers

  // handles the submission of skillTodos from the skilltodoform
  const handleAddTodo = async (newTodoData: Omit<newSkillTodo, "skillId">) => {
    setIsSubmittingForm(true);
    const tempId = generateTempId();

    // update object
    const optimisticTodos: skillTodo = {
      id: tempId,
      skill_id: skillId,
      ...newTodoData,
      resourceLink: null,
      resourceLinkTitle: null,
      date: new Date().toISOString(),
      duration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSkillTodos((prev) => [optimisticTodos, ...prev]);
    setIsAddingTodo(false);

    //calling server action and use Transition

    toast
      .promise(
        (async () => {
          const dataToSend: newSkillTodo = {
            ...newTodoData,
            skillId: skillId,
          };
          const result = await addSkillTasks(dataToSend);
          if (result.success && result.newTask) {
            setSkillTodos((prev) =>
              prev.map((t) => (t.id === tempId ? result.newTask! : t))
            );
          } else {
            throw new Error(result.error || "Failed to add task");
          }
        })(),
        {
          loading: "Adding task...",
          success: "Task added successfully",
          error: "Something went wrong while adding task",
        }
      )
      .catch((err) => {
        console.error(err);
        setSkillTodos((prev) => prev.filter((t) => t.id !== tempId));
        setIsAddingTodo(true);
      })
      .finally(() => {
        setIsSubmittingForm(false);
      });
  };
  //--------- handles update time from the task card----
  const handleUpdateTime = async (todoId: string, minutes: number) => {
    const originalTodos = skillTodos;
    setUpdatingTodoId(todoId);
    // optimistic ui update
    setSkillTodos((prev) =>
      prev.map((skillTodo) =>
        skillTodo.id === todoId
          ? {
              ...skillTodo,
              duration: minutes,
              updatedAt: new Date().toISOString(),
            }
          : skillTodo
      )
    );
    toast
      .promise(
        (async () => {
          const result = await updateskillTaskTime(todoId, minutes, skillId);
          if (!result.success) {
            console.error("Failed to update skillTodo time:", result.error);
            setSkillTodos(originalTodos);
          }
        })(),
        {
          loading: "Adding time to task...",
          success: "Time added successfully",
          error: "failed to add time to task",
        }
      )
      .catch((err) => {
        console.error("Error adding time:", err);
        setSkillTodos(originalTodos);
      })
      .finally(() => {
        setUpdatingTodoId(null);
      });
  };

  //------------------- handles saving task details from todoCard edit
  const handleEditTodo = async (
    todoId: string,
    updatedFields: Partial<
      Omit<skillTodo, "id" | "createdAt" | "date" | "duration">
    >
  ) => {
    const originalTodos = skillTodos;
    setUpdatingTodoId(todoId);
    // optimistic update
    setSkillTodos((prev) =>
      prev.map((skillTodo) =>
        skillTodo.id === todoId
          ? {
              ...skillTodo,
              ...updatedFields,
              updatedAt: new Date().toISOString(),
            }
          : skillTodo
      )
    );
    // data sending for the editTask server action and only allowed fields are send
    const dataToSend = {
      title: updatedFields.title || "",
      description:
        updatedFields.description !== undefined
          ? updatedFields.description
          : null,
      resourceLink:
        updatedFields.resourceLink !== undefined
          ? updatedFields.resourceLink
          : null,
      tags: updatedFields.tags || [],
    };
    //client side validation
    if (!dataToSend.title.trim()) {
      console.error("title cannot be empty.");
      setSkillTodos(originalTodos);
      setUpdatingTodoId(null);
      return;
    }
    toast
      .promise(
        (async () => {
          const result = await editSkillTask(todoId, dataToSend);
          if (!result.success) {
            console.error("Failed to edit Todo details:", result.error);
          }
        })(),
        {
          loading: "Updating Todo details",
          success: "Sucessfully updated todo details",
          error: "Failed to update todo details",
        }
      )
      .catch((err) => {
        console.error("Error updating task:", err);
        setSkillTodos(originalTodos);
      })
      .finally(() => {
        setUpdatingTodoId(null);
      });
  };

  // toggle todo card
  const handleToggleTodo = async (todoId: string, newDone: boolean) => {
    const originalTodos = skillTodos;

    setSkillTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId ? { ...todo, done: newDone } : todo
      )
    );

    toast
      .promise(
        (async () => {
          const result = await toggleTaskDone(todoId, skillId, newDone);
          if (!result.success) {
            console.error("Failed to toggle todo:", result.error);
            setSkillTodos(originalTodos); // rollback
          }
        })(),
        {
          loading: newDone ? "Marking as done..." : "Unmarking...",
          success: newDone ? "Marked as done ✅" : "Marked as not done ❌",
          error: "Something went wrong while toggling task.",
        }
      )
      .catch((err) => {
        console.error("Error toggling task:", err);
        setSkillTodos(originalTodos); // rollback again if needed
      });
  };
  //---------------- handles deleting a task
  const handleDeleteTodo = async (todoId: string) => {
    const originalTodos = skillTodos;
    setDeletingTodoId(todoId);
    setSkillTodos((prev) =>
      prev.filter((skillTodo) => skillTodo.id !== todoId)
    );
    //calling server action and use transition

    toast
      .promise(
        (async () => {
          const result = await deleteSkillTask(todoId, skillId);
          if (!result.success) {
            console.error("Failed to delete todo:", result.error);
            setSkillTodos(originalTodos);
          }
        })(),
        {
          loading: "Deleting task....",
          success: "Task deleted successfully!",
          error: "Something went wrong while deleting task.",
        }
      )
      .catch((err) => {
        console.error("Error deleting try again:", err);
      })
      .finally(() => {
        setDeletingTodoId(null);
      });
  };
  // adding resources link on the task card
  const handleAddResource = async (resourceTitle: string, url: string) => {
    if (!selectedTodoId) return;

    setIsAddingResource(true);
    const originalTodos = skillTodos;

    // Optimistic update
    setSkillTodos((prev) =>
      prev.map((todo) =>
        todo.id === selectedTodoId
          ? {
              ...todo,
              resourceLink: url,
              resourceLinkTitle: resourceTitle,
              updatedAt: new Date().toISOString(),
            }
          : todo
      )
    );

    startTransition(async () => {
      try {
        const result = await updateTaskResource(selectedTodoId, {
          resourceLink: url,
          resourceLinkTitle: resourceTitle,
        });

        if (!result.success) {
          console.error("Failed to add resource:", result.error);
          setSkillTodos(originalTodos);
        }
      } catch (error) {
        console.error("Error adding resource:", error);
        setSkillTodos(originalTodos);
      } finally {
        setIsAddingResource(false);
        setSelectedTodoId(null);
      }
    });
  };

  const handleOpenResourceModal = (todoId: string) => {
    setSelectedTodoId(todoId);
    setShowResourceModal(true);
  };

  // combined loading state
  return (
    <div className="container mx-auto max-w-4xl p-4 ">
      <div>
        <div className="flex  justify-between items-center mb-4">
          <span>{skillSlug}</span>
        </div>
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
                onClose={() => {
                  setShowResourceModal(false);
                  setSelectedTodoId(null);
                }}
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
