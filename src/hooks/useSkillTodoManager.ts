import {
  addSkillTasks,
  deleteSkillTask,
  editSkillTask,
  toggleTaskDone,
} from "@/actions/skillTaskAction";
import { newSkillTodo, skillTodo } from "@/types/skillDashboardTypes";
import { useState } from "react";
import toast from "react-hot-toast";

interface useSkillTodoManagerProps {
  initialSkillTodos: skillTodo[];
  skillId: string;
  onTimeUpdate?: () => void; // Callback to refresh analytics data
  onRefreshTimeData?: () => void; // Callback to refresh time data
}

//generating temp id for the todo
const generateTempId = (): string => {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useSkillTodoManager = ({
  initialSkillTodos,
  skillId,
}: useSkillTodoManagerProps) => {
  //all states - remove it and use state management for clean look
  const [skillTodos, setSkillTodos] = useState<skillTodo[]>(initialSkillTodos);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  // event Handlers
  const handleAddTodo = async (newTodoData: Omit<newSkillTodo, "skillId">) => {
    setIsSubmittingForm(true);
    const tempId = generateTempId();

    // update object
    const optimisticTodos: skillTodo = {
      id: tempId,
      skill_id: skillId,
      ...newTodoData,
      date: new Date().toISOString(),
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

  //To handle the submission of the skillTodos from the form
  return {
    //states
    skillTodos,
    isAddingTodo,

    updatingTodoId,
    deletingTodoId,
    isSubmittingForm,

    //state actions
    setIsAddingTodo,
    handleAddTodo,

    handleEditTodo,
    handleToggleTodo,

    handleDeleteTodo,
  };
};
