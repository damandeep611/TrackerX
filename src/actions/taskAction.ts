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
  //session management to get the session data associated with the incoming request
  //'headers()' provides the necessary context for the auth library to find the session token or cookie
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }
  //if user is authenticated then return the authenticated user's ID
  return session.user.id;
}

// --------------1. Get Tasks Action
export async function getTasks(): Promise<Todo[]> {
  const userId = await getUserId();

  // Fetch tasks from the 'task' table for the logged-in user, ordered by creation date descending
  const tasks = await db
    .select()
    .from(task)
    .where(eq(task.user_id, userId)) // filter: where user_id matches the loggedin user's ID
    .orderBy(desc(task.createdAt)); // Order by newest first

  // Map raw database results to the Todo type expected by the frontend
  // Ensure date fields are converted to strings as db return date objects and objects aren't directly serilizable for sending to client
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

//------------------- 2. Add Task Action
//this add task will take NewTodo  data as input
export async function addTask(
  newTodo: NewTodo
): Promise<{ success: boolean; error?: string; newTask?: Todo }> {
  const userId = await getUserId();

  // Basic validation (matches TodoForm validation)
  if (!newTodo.title || !newTodo.title.trim()) {
    return { success: false, error: "Title is required" };
  }

  try {
    // Insert new row into the 'task' table
    const insertedTasks = await db
      .insert(task)
      .values({
        //map the input data to the corresponding table columns
        user_id: userId,
        title: newTodo.title.trim(),
        description: newTodo.description?.trim() || null, // Handle empty string
        tag: newTodo.tag?.trim() || null,
        //drizzle/db default handle: id, date, createdAt, updatedAt, duration
      })
      .returning(); // fetching newly inserted rows from db
    //check if the insertion was successful and data was returned
    if (!insertedTasks || insertedTasks.length === 0) {
      throw new Error("Failed to insert task or retrieve result.");
    }
    //get the data for the task that was just created
    const createdTask = insertedTasks[0];
    //Next js caching -Cache invalidation
    //invalidate the cahce for the root path("/"), as this tells next js to re-fetch data the next time this path is requested to ensure new tasks appear in the list
    // Revalidate the path where the TodoList is displayed
    revalidatePath("/"); // Adjust the path as needed if the task list route is elsewhere (e.g., '/dashboard', '/tasks')

    //data transformation /serilization
    // convert the newly created task in the 'Todo'Format
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

//--------------- 3. Update Task Time Action
// action to update the tracked time for specific task
export async function updateTaskTime(
  taskId: string,
  newDuration: number
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId();

  // Input validation to validate the incoming duration value
  if (typeof newDuration !== "number" || newDuration < 0) {
    return { success: false, error: "Invalid duration value." };
  }

  try {
    //update rows in the 'task' table
    const result = await db
      .update(task)
      .set({
        duration: newDuration, //set the new duration
        updatedAt: new Date(), // Update the timestamp to reflect the change
      })
      .where(and(eq(task.id, taskId), eq(task.user_id, userId))); // authorization and targeting to specify which rows to update in which - must match the task id and must belong to the authenticated user
    //check if any rows were updated ,
    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to update it.",
      };
    }
    //invalidate cache to reflect the updated time on the frontend
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

//-------------------- 4. Edit Task Action
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

  // input validationt to ensure title is not empty
  if (!updatedFields.title || !updatedFields.title.trim()) {
    return { success: false, error: "Title is required" };
  }

  try {
    //updating query
    const result = await db
      .update(task)
      .set({
        //update specified fields, trimming whitespaces or settingnull if emtpy
        title: updatedFields.title.trim(),
        description: updatedFields.description?.trim() || null,
        tag: updatedFields.tag?.trim() || null,
        updatedAt: new Date(), // Update the timestamp
      })
      .where(and(eq(task.id, taskId), eq(task.user_id, userId))); // to also check the updation happens only to the user id belonging to the user

    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to edit it.",
      };
    }

    revalidatePath("/"); //invalidating cache to show the edited details
    return { success: true };
  } catch (error) {
    console.error("Failed to edit task:", error);
    return { success: false, error: "Failed to edit task. Please try again." };
  }
}

// ------------------5. Delete Task Action
export async function deleteTask(
  taskId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getUserId();

  try {
    //delete query to delete rows from the 'task' table
    //specifiy which row to delete and matching taskId and userId
    const result = await db
      .delete(task)
      .where(and(eq(task.id, taskId), eq(task.user_id, userId)));

    if (result.rowCount === 0) {
      return {
        success: false,
        error: "Task not found or you don't have permission to delete it.",
      };
    }
    //invalidate cache so the deleted task disappear from the list
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
