"use client";

import { useState } from "react";
import { PlusCircle, XCircle } from "lucide-react";
import { NewTodo, Todo } from "@/types/todoTypes";
import TodoForm from "./TodoForm";
import TodoCard from "./TodoCard";



interface TodoListProps {
  initialTodos?: Todo[];
}

export function TodoList({ initialTodos = [] }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<string | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<string | null>(null);

  // Generate a temporary ID for new todos (in real app, this would be done by the backend)
  const generateTempId = (): string => {
    return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleAddTodo = async (newTodo: NewTodo) => {
    setIsSubmitting(true);
    
    try {
      // In a real app, this would be an API call to create a todo
      // Simulate a delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const createdAt = new Date().toISOString();
      const todo: Todo = {
        id: generateTempId(),
        ...newTodo,
        date: new Date().toISOString(),
        duration: 0,
        createdAt,
        updatedAt: createdAt,
      };
      
      setTodos(prev => [todo, ...prev]);
      setIsAddingTodo(false);
    } catch (error) {
      console.error("Failed to add todo:", error);
      // Would show an error notification in a real app
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTime = async (todoId: string, minutes: number) => {
    setUpdatingTodoId(todoId);
    
    try {
      // In a real app, this would be an API call to update the todo
      // Simulate a delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTodos(prev => 
        prev.map(todo => 
          todo.id === todoId 
            ? { ...todo, duration: minutes, updatedAt: new Date().toISOString() } 
            : todo
        )
      );
    } catch (error) {
      console.error("Failed to update todo time:", error);
      // Would show an error notification in a real app
    } finally {
      setUpdatingTodoId(null);
    }
  };

  const handleEditTodo = async (todoId: string, updatedFields: Partial<Todo>) => {
    setUpdatingTodoId(todoId);
    
    try {
      // In a real app, this would be an API call to update the todo
      // Simulate a delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setTodos(prev => 
        prev.map(todo => 
          todo.id === todoId 
            ? { ...todo, ...updatedFields, updatedAt: new Date().toISOString() } 
            : todo
        )
      );
    } catch (error) {
      console.error("Failed to edit todo:", error);
      // Would show an error notification in a real app
    } finally {
      setUpdatingTodoId(null);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    setDeletingTodoId(todoId);
    
    try {
      // In a real app, this would be an API call to delete the todo
      // Simulate a delay for demonstration
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (error) {
      console.error("Failed to delete todo:", error);
      // Would show an error notification in a real app
    } finally {
      setDeletingTodoId(null);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
          {!isAddingTodo && (
            <button
              onClick={() => setIsAddingTodo(true)}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <PlusCircle size={18} className="mr-2" />
              Add Task
            </button>
          )}
        </div>
        
        {isAddingTodo && (
          <div className="relative">
            <button
              onClick={() => setIsAddingTodo(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              aria-label="Cancel adding task"
            >
              <XCircle size={20} />
            </button>
            <TodoForm
              onAddTodo={handleAddTodo}
              onCancel={() => setIsAddingTodo(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        )}
      </div>

      {todos.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No tasks yet. Add a task to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {todos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onUpdateTime={handleUpdateTime}
              onEditTodo={handleEditTodo}
              onDeleteTodo={handleDeleteTodo}
              isUpdating={updatingTodoId === todo.id}
              isDeleting={deletingTodoId === todo.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}