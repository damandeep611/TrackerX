"use client"
import { newSkillTodo, skillTodo } from "@/types/skillDashboardTypes";
import React, { useState, useTransition } from "react";
import SkillTodoForm from "./skill-todo-form";
import SkillTodoCard from "./skill-todo-card";
import {
  addSkillTasks,
  deleteSkillTask,
  editSkillTask,
  updateskillTaskTime,
  updateTaskResource,
} from "@/actions/skillTaskAction";
import ResourceModal from "./resource-modal";

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
    startTransition(async () => {
      try {
        // prepare data with SkillId for the server action
        const dataToSend: newSkillTodo = {
          ...newTodoData,
          skillId: skillId,
        };
        //call the addskillTask server action with the form data
        const result = await addSkillTasks(dataToSend);
        if (result.success && result.newTask) {
          setSkillTodos((prev) =>
            prev.map((t) => (t.id === tempId ? result.newTask! : t))
          );
        } else {
          console.error("Failed to add skillTodo:", result.error);
          setSkillTodos((prev) => prev.filter((t) => t.id !== tempId));
          setIsAddingTodo(true);
        }
      } catch (error) {
        console.error("Error calling addskillTask:", error);
        setSkillTodos((prev) => prev.filter((t) => t.id !== tempId));
        setIsAddingTodo(true);
        // !show toast here after adding todo
      } finally {
        setIsSubmittingForm(false);
      }
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
    //server actions and useTransitions
    startTransition(async () => {
      try {
        // passs skillId to update action
        const result = await updateskillTaskTime(todoId, minutes, skillId);
        if (!result.success) {
          console.error("Failed to update skillTodo time:", result.error);
          setSkillTodos(originalTodos);
        }
      } catch (error) {
        console.error("Error calling updateSkillTaskTime:", error);
        setSkillTodos(originalTodos);
      } finally {
        setUpdatingTodoId(null);
      }
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
    //calling server action and usetransition
    startTransition(async () => {
      try {
        //asuuming editSkilltask doesn't directly impact total hours

        const result = await editSkillTask(todoId, dataToSend);
        if (!result.success) {
          console.error("Failed to edit skill Todo:", result.error);
        }
      } catch (error) {
        console.error("Error calling editTask:", error);
        setSkillTodos(originalTodos);
      } finally {
        setUpdatingTodoId(null);
      }
    });
  };
  //---------------- handles deleting a task
  const handleDeleteTodo = async (todoId: string) => {
    if (!window.confirm("Are you sure you want to delete this task")) {
      return;
    }
    const originalTodos = skillTodos;
    setDeletingTodoId(todoId);
    setSkillTodos((prev) =>
      prev.filter((skillTodo) => skillTodo.id !== todoId)
    );
    //calling server action and use transition
    startTransition(async () => {
      try {
        const result = await deleteSkillTask(todoId, skillId);
        if (!result.success) {
          console.error("Failed to delete todo:", result.error);
          setSkillTodos(originalTodos);
        }
      } catch (error) {
        console.error("Error calling deleteSkillTask:", error);
      } finally {
        setDeletingTodoId(null);
      }
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
      {isPending && (
        <div className="text-center text-gray-400 py-2">Processing....</div>
      )}

      {/* to show the tasks if there are any and showing no tasks title if there are 0 tasks */}
      {skillTodos.length === 0 && !isPending ? (
        <div>
          <p>No tasks added yet , add to get started</p>
        </div>
      ) : (
        <div className="relative ">
          {/* timeline line */}
          <div className="absolute   top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-500"></div>
          <div className="space-y-8 my-6 ">
            {skillTodos.map((skillTodo) => (
              <SkillTodoCard
                key={skillTodo.id}
                todo={skillTodo}
                onUpdateTime={handleUpdateTime}
                onEditTodo={handleEditTodo}
                onDeleteTodo={handleDeleteTodo}
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
          </div>
        </div>
      )}
    </div>
  );
}
