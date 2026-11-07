"use server";
import { db } from "@/db/drizzle";
import { goals } from "@/db/schema/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { parseInput, zId, zText } from "@/lib/validation";

const zSlug = z.string().trim().min(1).max(200).regex(/^[\w-]+$/, "Invalid slug");
const zIsoDate = z.string().refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date");

// Get all goals for the current user
export async function getGoals() {
  const userId = await requireUser();

  const userGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, userId))
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

// Get a single goal by slug
export async function getGoalBySlug(slug: string) {
  const userId = await requireUser();
  const parsedSlug = zSlug.safeParse(slug);
  if (!parsedSlug.success) return null;
  slug = parsedSlug.data;

  const [goal] = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.slug, slug),
        eq(goals.userId, userId)
      )
    );

  if (!goal) return null;

  return {
    ...goal,
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
    startDate: goal.startDate?.toISOString() || undefined,
    completedDate: goal.completedDate?.toISOString() || undefined,
  };
}

// Add a new goal
export async function addGoal(data: {
  title: string;
  slug?: string;
}) {
  const userId = await requireUser();
  const { title, slug } = parseInput(
    z.object({ title: zText(255), slug: zSlug.optional() }),
    data
  );

  const generatedSlug = slug || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  const now = new Date();

  const [newGoal] = await db.insert(goals)
    .values({
      title,
      slug: generatedSlug,
      userId: userId,
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
export async function updateGoalStartDate(data: {
  id: string;
  startDate: string;
}) {
  const userId = await requireUser();
  const { id, startDate } = parseInput(z.object({ id: zId, startDate: zIsoDate }), data);

  const [updatedGoal] = await db.update(goals)
    .set({
      startDate: new Date(startDate),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(goals.id, id),
        eq(goals.userId, userId)
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
  const userId = await requireUser();
  id = parseInput(zId, id);

  await db.delete(goals)
    .where(
      and(
        eq(goals.id, id),
        eq(goals.userId, userId)
      )
    );

  return { success: true };
}

// Toggle goal completion
export async function toggleGoalCompletion(data: {
  id: string;
  isCompleted: boolean;
  completedDate?: string;
}) {
  const userId = await requireUser();
  const { id, isCompleted, completedDate } = parseInput(
    z.object({ id: zId, isCompleted: z.boolean(), completedDate: zIsoDate.optional() }),
    data
  );

  const [updatedGoal] = await db.update(goals)
    .set({
      completedDate: isCompleted ? new Date(completedDate || new Date()) : null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(goals.id, id),
        eq(goals.userId, userId)
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