"use server";
import { db } from "@/db/drizzle";
import { goals } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

// Get all goals for the current user
export async function getGoals() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, session.user.id))
    .then((goals) =>
      goals.map((goal) => ({
        ...goal,
        createdAt: goal.createdAt.toISOString(),
        updatedAt: goal.updatedAt.toISOString(),
        startDate: goal.startDate?.toISOString() || undefined,
        completedDate: goal.completedDate?.toISOString() || undefined,
      }))
    );

  return userGoals;
}

// Add a new goal
export async function addGoal({
  title,
}: {
  title: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const now = new Date();

  const [newGoal] = await db.insert(goals)
    .values({
      title,
      userId: session.user.id,
      isCompleted: false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return {
    ...newGoal,
    createdAt: newGoal.createdAt.toISOString(),
    updatedAt: newGoal.updatedAt.toISOString(),
  };
}

// Update goal start date
export async function updateGoalStartDate({
  id,
  startDate,
}: {
  id: string;
  startDate: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const [updatedGoal] = await db.update(goals)
    .set({
      startDate: new Date(startDate),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(goals.id, id),
        eq(goals.userId, session.user.id)
      )
    )
    .returning();

  return {
    ...updatedGoal,
    createdAt: updatedGoal.createdAt.toISOString(),
    updatedAt: updatedGoal.updatedAt.toISOString(),
    startDate: updatedGoal.startDate?.toISOString() || undefined,
    completedDate: updatedGoal.completedDate?.toISOString() || undefined,
  };
}

// Toggle goal completion
export async function toggleGoalCompletion({
  id,
  isCompleted,
  completedDate,
  daysToComplete,
}: {
  id: string;
  isCompleted: boolean;
  completedDate?: string;
  daysToComplete?: number;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const [updatedGoal] = await db.update(goals)
    .set({
      isCompleted,
      completedDate: completedDate ? new Date(completedDate) : null,
      daysToComplete: daysToComplete || null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(goals.id, id),
        eq(goals.userId, session.user.id)
      )
    )
    .returning();

  return {
    ...updatedGoal,
    createdAt: updatedGoal.createdAt.toISOString(),
    updatedAt: updatedGoal.updatedAt.toISOString(),
    startDate: updatedGoal.startDate?.toISOString() || undefined,
    completedDate: updatedGoal.completedDate?.toISOString() || undefined,
  };
}

// Add reflection note
export async function addGoalReflection({
  id,
  reflectionNote,
}: {
  id: string;
  reflectionNote: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const [updatedGoal] = await db.update(goals)
    .set({
      reflectionNote,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(goals.id, id),
        eq(goals.userId, session.user.id)
      )
    )
    .returning();

  return {
    ...updatedGoal,
    createdAt: updatedGoal.createdAt.toISOString(),
    updatedAt: updatedGoal.updatedAt.toISOString(),
    startDate: updatedGoal.startDate?.toISOString() || undefined,
    completedDate: updatedGoal.completedDate?.toISOString() || undefined,
  };
}

// Delete goal
export async function deleteGoal(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  await db.delete(goals)
    .where(
      and(
        eq(goals.id, id),
        eq(goals.userId, session.user.id)
      )
    );

  return { success: true };
} 