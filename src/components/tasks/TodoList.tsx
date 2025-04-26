// src/components/TodoList.tsx (or your component path)
"use client";

import { useState, useTransition } from "react"; // Import useTransition
import { PlusCircle, XCircle } from "lucide-react";
import { NewTodo, Todo } from "@/types/todoTypes";
import TodoForm from "./TodoForm"; // [cite: 60]
import TodoCard from "./TodoCard"; // [cite: 60]
// Import your server actions
import {
  addTask,
  updateTaskTime,
  editTask,
  deleteTask,
} from "@/actions/taskAction"; // Adjust path as needed

interface TodoListProps {
  initialTodos?: Todo[]; // [cite: 61] Passed from a Server Component ideally
}

// Helper function to generate temporary IDs for optimistic updates
const generateTempId = (): string => {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export function TodoList({ initialTodos = [] }: TodoListProps) {
  // [cite: 61]
  const [todos, setTodos] = useState<Todo[]>(initialTodos); // [cite: 61]
  const [isAddingTodo, setIsAddingTodo] = useState(false); // [cite: 62]
  // Use useTransition for non-critical state updates during server actions
  const [isPending, startTransition] = useTransition();
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null); // [cite: 62]
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null); // [cite: 63]
  // Keep track of submission state for the form specifically
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const handleAddTodo = async (newTodoData: NewTodo) => {
    // [cite: 64]
    setIsSubmittingForm(true); // Indicate form submission start
    const tempId = generateTempId();

    // 1. Optimistic UI update
    const optimisticTodo: Todo = {
      id: tempId, // Use temporary ID for the key
      ...newTodoData,
      date: new Date().toISOString(),
      duration: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTodos((prev) => [optimisticTodo, ...prev]); // [cite: 67] Add to list immediately
    setIsAddingTodo(false); // Close the form

    startTransition(async () => {
      try {
        // 2. Call server action
        const result = await addTask(newTodoData);

        // 3. Handle response
        if (result.success && result.newTask) {
          // Replace optimistic todo with the real one from the server
          setTodos((prev) =>
            prev.map((t) => (t.id === tempId ? result.newTask! : t))
          );
        } else {
          console.error("Failed to add todo:", result.error);
          // Revert optimistic update on failure
          setTodos((prev) => prev.filter((t) => t.id !== tempId));
          setIsAddingTodo(true); // Optional: reopen form on error
          // TODO: Show user-friendly error notification
        }
      } catch (error) {
        console.error("Error calling addTask:", error);
        // Revert optimistic update on unexpected error
        setTodos((prev) => prev.filter((t) => t.id !== tempId));
        setIsAddingTodo(true); // Optional: reopen form on error
        // TODO: Show user-friendly error notification
      } finally {
        setIsSubmittingForm(false); // Indicate form submission end
      }
    });
  };

  const handleUpdateTime = async (todoId: string, minutes: number) => {
    // [cite: 69]
    const originalTodos = todos; // Store original state for potential revert
    setUpdatingTodoId(todoId); // Set loading state for this specific card [cite: 69]

    // 1. Optimistic UI update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? { ...todo, duration: minutes, updatedAt: new Date().toISOString() } // [cite: 71]
          : todo
      )
    );

    startTransition(async () => {
      try {
        // 2. Call server action
        const result = await updateTaskTime(todoId, minutes);

        // 3. Handle response
        if (!result.success) {
          console.error("Failed to update todo time:", result.error);
          // Revert optimistic update on failure
          setTodos(originalTodos);
          // TODO: Show user-friendly error notification
        }
        // On success, the optimistic update is already applied
      } catch (error) {
        console.error("Error calling updateTaskTime:", error);
        // Revert optimistic update on unexpected error
        setTodos(originalTodos);
        // TODO: Show user-friendly error notification
      } finally {
        setUpdatingTodoId(null); // [cite: 73] Clear loading state for the card
      }
    });
  };

  const handleEditTodo = async (
    todoId: string,
    updatedFields: Partial<Omit<Todo, "id" | "createdAt" | "date" | "duration">>
  ) => {
    // [cite: 74] Ensure type safety for editable fields
    const originalTodos = todos;
    setUpdatingTodoId(todoId); // Use updating state for visual feedback [cite: 74]

    // 1. Optimistic UI update
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === todoId
          ? { ...todo, ...updatedFields, updatedAt: new Date().toISOString() } // [cite: 76]
          : todo
      )
    );

    // Prepare data for the server action (only fields allowed by the action)
    const dataToSend = {
      title: updatedFields.title || "", // Assuming title is always part of the update
      description:
        updatedFields.description !== undefined
          ? updatedFields.description
          : null,
      tag: updatedFields.tag !== undefined ? updatedFields.tag : null,
    };

    // Basic client-side validation (mirroring server action)
    if (!dataToSend.title.trim()) {
      console.error("Title cannot be empty.");
      setTodos(originalTodos); // Revert
      setUpdatingTodoId(null);
      // TODO: Show validation error in the edit form itself (TodoCard)
      return;
    }

    startTransition(async () => {
      try {
        // 2. Call server action
        const result = await editTask(todoId, dataToSend);

        // 3. Handle response
        if (!result.success) {
          console.error("Failed to edit todo:", result.error);
          // Revert optimistic update on failure
          setTodos(originalTodos);
          // TODO: Show user-friendly error notification
        }
        // On success, the optimistic update is already applied
      } catch (error) {
        console.error("Error calling editTask:", error);
        // Revert optimistic update on unexpected error
        setTodos(originalTodos);
        // TODO: Show user-friendly error notification
      } finally {
        setUpdatingTodoId(null); // [cite: 78] Clear loading state
      }
    });
  };

  const handleDeleteTodo = async (todoId: string) => {
    // [cite: 79]
    // Optional: Confirm deletion [cite: 79]
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const originalTodos = todos;
    setDeletingTodoId(todoId); // Set deleting state for visual feedback [cite: 80]

    // 1. Optimistic UI update
    setTodos((prev) => prev.filter((todo) => todo.id !== todoId)); // [cite: 81] Remove immediately

    startTransition(async () => {
      try {
        // 2. Call server action
        const result = await deleteTask(todoId);

        // 3. Handle response
        if (!result.success) {
          console.error("Failed to delete todo:", result.error);
          // Revert optimistic update on failure
          setTodos(originalTodos);
          // TODO: Show user-friendly error notification
        }
        // On success, the optimistic update is already applied
      } catch (error) {
        console.error("Error calling deleteTask:", error);
        // Revert optimistic update on unexpected error
        setTodos(originalTodos);
        // TODO: Show user-friendly error notification
      } finally {
        setDeletingTodoId(null); // [cite: 82] Clear deleting state
      }
    });
  };

  // Determine combined loading state for disabling buttons etc.
  const isLoading = isPending || !!updatingTodoId || !!deletingTodoId;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
          {!isAddingTodo && (
            <button
              onClick={() => setIsAddingTodo(true)}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50" // [cite: 84]
              disabled={isLoading} // Disable if any operation is pending
            >
              <PlusCircle size={18} className="mr-2" />
              Add Task
            </button>
          )}
        </div>

        {isAddingTodo && ( // [cite: 85]
          <div className="relative  rounded-lg shadow-md p-4 border border-gray-200">
            <button
              onClick={() => setIsAddingTodo(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 disabled:opacity-50" // [cite: 85]
              aria-label="Cancel adding task"
              disabled={isSubmittingForm} // Disable cancel only while form is actively submitting
            >
              <XCircle size={20} />
            </button>
            {/* Pass form submitting state to TodoForm */}
            <TodoForm // [cite: 86]
              onAddTodo={handleAddTodo}
              onCancel={() => setIsAddingTodo(false)}
              isSubmitting={isSubmittingForm} // [cite: 86] Use specific form state
            />
          </div>
        )}
      </div>

      {/* Loading indicator for background operations */}
      {isPending && (
        <div className="text-center text-gray-500 py-2">Processing...</div>
      )}

      {todos.length === 0 && !isPending ? ( // [cite: 88]
        <div className="text-center py-10">
          <p className="text-gray-500">
            No tasks yet. Add a task to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id} // Use todo.id (temporary or real) as the key
              todo={todo} // [cite: 89]
              onUpdateTime={handleUpdateTime} // [cite: 89]
              onEditTodo={handleEditTodo} // [cite: 89]
              onDeleteTodo={handleDeleteTodo} // [cite: 89]
              // Pass loading states to TodoCard
              isUpdating={updatingTodoId === todo.id} // [cite: 89]
              isDeleting={deletingTodoId === todo.id} // [cite: 89]
            />
          ))}
        </div>
      )}
    </div>
  );
}
