"use server";

import { db } from "@/db/drizzle";
import { skillTask } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { newSkillTodo, skillTodo } from "@/types/skillDashboardTypes";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

//async function to get authenticated user id to use for server action functions
async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("User not Authenticated");
  }
  return session.user.id;
}

// now the server action CRUD operations

// fetch all the tasks by the user id
export async function getSkillTasks(): Promise<skillTodo[]> {
  // ensure the user is authenticated and get their id
  const userId = await getUserId();

  //-------1. fetch tasks from the skillTasks table
  const skillTasks = await db
    .select() //select all columns
    .from(skillTask) //from the skillTask table
    .where(eq(skillTask.user_id, userId)) //where user_id matches the loggedin userId
    .orderBy(desc(skillTask.createdAt)); //order results by creation date, newest first

  // now data transformation and serialization for the data we are fetching from the database
  return skillTasks.map((t) => ({
    id: t.id,
    title: t.title,
    tag: t.tag,
    description: t.description,
    //converting date objects to ISO strings
    date: t.date.toISOString(),
    duration: t.duration,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));
}

//----2. Adding task

export async function addSkillTasks(
  newTodo: newSkillTodo
): Promise<{ success: boolean; error?: string; newTask?: skillTodo }> {
  //getting user id
  const userId = await getUserId();

  // server side input validation to ensure all input fields are present
  if (!newTodo.title || !newTodo.title.trim()) {
    return { success: false, error: "Title is required" };
  }
  try {
    //insert a new row into the skillTask table
    const insertedTasks = await db
      .insert(skillTask)
      .values({
        //map the input data into the corresponding  table columns
        user_id: userId,
        title: newTodo.title.trim(),
        description: newTodo.description?.trim() || null,
        tag: newTodo.tag?.trim() || null,
      })
      .returning(); //ask the database to return the newly inserted row

      //check if the insertion was successful and data is returned
      if(!insertedTasks || insertedTasks.length === 0){
        throw new Error("Failed to retrieve tasks or retrieve results")
      }
      //get the data for the task that was just created
      const createdSkillTask = insertedTasks[0];
      //next js caching and cache validation
      revalidatePath("/")
      // data serialization
      const newTask: skillTodo = {
        id: createdSkillTask.id,
        title: createdSkillTask.title,
        tag: createdSkillTask.tag,
        description: createdSkillTask.description,
        date: createdSkillTask.date.toISOString(),
        duration: createdSkillTask.duration,
        createdAt: createdSkillTask.createdAt.toISOString(),
        updatedAt: createdSkillTask.updatedAt.toISOString(),
      }
      //return success and newly created skill task data
      return {success: true, newTask}
  } catch (error) {
    console.log("Failed to add skill Task to the skill card", error);
    return {success: false, error: "Failed to add Task. Please try again"}
  }
}


// to update the tracked time duration for specific task

export async function updateskillTaskTime(taskId: string, newDuration: number): Promise<{success: boolean, error?: string}>{
  //fetching userId 
  const userId = await getUserId();

  //input validation 
  if(typeof newDuration !== "number" || newDuration < 0){
    return {success: false, error: "Invalid duration value"}
  }
  try {
    //update rows in the task table 
    const result = await db.update(skillTask).set({duration: newDuration, updatedAt: new Date(),}).where(and(eq(skillTask.id, taskId), eq(skillTask.user_id, userId)))
    if(result.rowCount === 0){
      return {success: false, error: "Task not found or you don't have permission to update it"}
    }
    revalidatePath("/");
    return {success: true}
  } catch (error) {
    console.error("Failed to update task time", error);
    return {success: false, error: "Failed to update task time. Please try again"}
  }
}

// Editing the skill card task
export async function editSkillTask(taskId: string, updatedFields: {title: string; description: string | null; tag: string | null}): Promise<{success: boolean; error?: string}>{
  //ensure user id authenticated
  const userId = await getUserId();

  //input validation
  //to ensure the edited form is not empty  
  if(!updatedFields.title || !updatedFields.title.trim()){
    return {success: false, error: "title is required"}
  }
  try{
    const result = await db.update(skillTask).set({
      title: updatedFields.title.trim(),
      description: updatedFields.description?.trim() || null,
      tag: updatedFields.tag?.trim() || null,
      updatedAt: new Date(),
    }).where(and(eq(skillTask.id, taskId), eq(skillTask.user_id, userId)));
    if(result.rowCount === 0){
      return {success: false, error: "Task not found or you don't have permission to edit it"}
    }
    // invalidate cache to show the edited details
    revalidatePath("/");
    return {success: true};
  }catch(error){
    console.error("failed to edit task", error);
    return {success: false, error: "Failed to edit task. Please try again"}
  }
} 

// Delete skill Task 

export async function deleteSkillTask (taskId: string): Promise<{success: boolean, error?: string}>{
  //user auth checking
  const userId = await getUserId();
  try{
    //delete rows from the 'skillTask' table
    const result = await db.delete(skillTask).where(and(eq(skillTask.id, taskId), eq(skillTask.user_id, userId)))
    //check if any rows were actually deleted
    if(result.rowCount === 0){
      //if no rows deleted, the task didn't exist or didn't belong to theuser
      return {success: false, error: "Task not found or you don't have permission to delete it"}

    }
    revalidatePath("/");
    return {success: true};
  }catch(error){
    console.error("Failed to delete task:", error);
    return {success: false, error: "Failed to delete task. Please try again"}
  }
}

