"use server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { headers } from "next/headers";
import { todo } from "@/db/schema/schema";
import { auth } from "@/lib/auth";

export async function getData() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  return db.select().from(todo).where(eq(todo.userId, session.user.id));
}

// adding todo
export async function addTodo(id: string, text: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  await db.insert(todo).values({
    id,
    text,
    done: false,
    userId: session.user.id,
  });
}
//--------Edit todo
export async function editTodo(id: string, newText: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  await db
    .update(todo)
    .set({ text: newText })
    .where(and(eq(todo.id, id), eq(todo.userId, session.user.id)));
}

export async function toggleTodo(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  // you could also inline a toggle, but here's the safe way:
  const [t] = await db
    .select({ done: todo.done })
    .from(todo)
    .where(and(eq(todo.id, id), eq(todo.userId, session.user.id)));

  if (!t) throw new Error("Not found or not yours");

  await db.update(todo).set({ done: !t.done }).where(eq(todo.id, id));
}

export async function deleteTodo(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  await db
    .delete(todo)
    .where(and(eq(todo.id, id), eq(todo.userId, session.user.id)));
}
