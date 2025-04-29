//the functions that are in the user server are executed on the server but can be directly called from client components
"use server";

import { and, eq, desc } from "drizzle-orm"; // these are the query builders functions that are imported from drizzle orm,
import { db } from "@/db/drizzle"; //db is the configured database instance to interact with the neon pg db
import { task } from "@/db/schema/schema"; // task schema which will map over the task database table in neon pg
import { auth } from "@/lib/auth"; // better auth - auth utilities
import { headers } from "next/headers"; // to access incoming request headers and session retrieval in server actions
import { revalidatePath } from "next/cache"; //to invalidate cache for specific route and to ensure fresh data is fetched
import { NewTodo, Todo } from "@/types/todoTypes"; // Import your types

//-- Helper function to get authenticated user ID, as this will fetch the current user session from auth
async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  return session.user.id;
}

// 1. Get Tasks Action
export async function getTasks(): Promise<Todo[]> {
  const userId = await getUserId();

  // Fetch tasks for the logged-in user, ordered by creation date descending
  const tasks = await db
    .select()
    .from(task)
    .where(eq(task.user_id, userId))
    .orderBy(desc(task.createdAt)); // Order by newest first

  // Map database results to the Todo type expected by the frontend
  // Ensure date fields are converted to strings (ISO format is common)
  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    tag: t.tag,
    description: t.description,
    // Convert Date objects to ISO strings for serialization
    date: t.date.toISOString(),
    duration: t.duration,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

// 2. Add Task Action
export async function addTask(
  newTodo: NewTodo
): Promise<{ success: boolean; error?: string; newTask?: Todo }> {
  const userId = await getUserId();

  // Basic validation (matches TodoForm validation)
  if (!newTodo.title || !newTodo.title.trim()) {
    return { success: false, error: "Title is required" };
  }

  try {
    // Insert the new task, Drizzle handles default values (id, date, createdAt, updatedAt, duration)
    const insertedTasks = await db
      .insert(task)
      .values({
        user_id: userId,
        title: newTodo.title.trim(),
        description: newTodo.description?.trim() || null, // Handle empty string
        tag: newTodo.tag?.trim() || null, // Handle empty string
        // Optional: You could allow setting an initial date/duration here if needed
        // date: new Date(), // Or parse from input if provided
        // duration: 0, // Default
      })
      .returning(); // Get the inserted task back

    if (!insertedTasks || insertedTasks.length === 0) {
      throw new Error("Failed to insert task or retrieve result.");
    }

    const createdTask = insertedTasks[0];

    // Revalidate the path where the TodoList is displayed
    revalidatePath("/"); // Adjust the path as needed (e.g., '/dashboard', '/tasks')

    // Return the newly created task in the format expected by the frontend
    const newTask: Todo = {
      id: createdTask.id,
      title: createdTask.title,
      tag: createdTask.tag,
      description: createdTask.description,
      date: createdTask.date.toISOString(),
      duration: createdTask.duration,
      createdAt: createdTask.createdAt.toISOString(),
      updatedAt: createdTask.updatedAt.toISOString(),
    };

    return { success: true, newTask };
  } catch (error) {
    console.error("Failed to add task:", error);
    return { success: false, error: "Failed to add task. Please try again." };
  }
}

// 3. Update Task Time Action
export async function updateTaskTime(
  taskId: string,
  newDuration: number
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId();

  // Validate duration (optional, but good practice)
  if (typeof newDuration !== "number" || newDuration < 0) {
    return { success: false, error: "Invalid duration value." };
  }

  try {
    const result = await db
      .update(task)
      .set({
        duration: newDuration,
        updatedAt: new Date(), // Update the timestamp
      })
      .where(and(eq(task.id, taskId), eq(task.user_id, userId)));

    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to update it.",
      };
    }

    revalidatePath("/"); // Adjust the path as needed
    return { success: true };
  } catch (error) {
    console.error("Failed to update task time:", error);
    return {
      success: false,
      error: "Failed to update task time. Please try again.",
    };
  }
}

// 4. Edit Task Action
// Takes the fields allowed to be edited from TodoCard [cite: 3, 11]
export async function editTask(
  taskId: string,
  updatedFields: {
    title: string;
    description: string | null;
    tag: string | null;
  }
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId();

  // Basic validation (matches TodoCard validation) [cite: 10]
  if (!updatedFields.title || !updatedFields.title.trim()) {
    return { success: false, error: "Title is required" };
  }

  try {
    const result = await db
      .update(task)
      .set({
        title: updatedFields.title.trim(),
        description: updatedFields.description?.trim() || null,
        tag: updatedFields.tag?.trim() || null,
        updatedAt: new Date(), // Update the timestamp
      })
      .where(and(eq(task.id, taskId), eq(task.user_id, userId)));

    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to edit it.",
      };
    }

    revalidatePath("/"); // Adjust the path as needed
    return { success: true };
  } catch (error) {
    console.error("Failed to edit task:", error);
    return { success: false, error: "Failed to edit task. Please try again." };
  }
}

// 5. Delete Task Action
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId();

  try {
    const result = await db
      .delete(task)
      .where(and(eq(task.id, taskId), eq(task.user_id, userId)));

    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to delete it.",
      };
    }

    revalidatePath("/"); // Adjust the path as needed
    return { success: true };
  } catch (error) {
    console.error("Failed to delete task:", error);
    return {
      success: false,
      error: "Failed to delete task. Please try again.",
    };
  }
}
