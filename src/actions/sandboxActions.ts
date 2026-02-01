"use server";

import { db } from "@/db/drizzle";
import { sandboxes, sandboxPhases, sandboxLogs } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createSandbox(data: { name: string; targetHours: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const [newSandbox] = await db
    .insert(sandboxes)
    .values({
      name: data.name,
      targetHours: data.targetHours,
      userId,
    })
    .returning();

  revalidatePath("/dashboard/sandbox");
  return newSandbox;
}

export async function getSandboxes() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;

  const userSandboxes = await db
    .select()
    .from(sandboxes)
    .where(eq(sandboxes.userId, userId));

  return userSandboxes;
}

// Phase Actions

export async function createPhase(sandboxId: string, data: { title: string; description: string; milestones: string[]; allocatedHours: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Calculate order index
  const existingPhases = await db
    .select({ orderIndex: sandboxPhases.orderIndex })
    .from(sandboxPhases)
    .where(eq(sandboxPhases.sandboxId, sandboxId))
    .orderBy(desc(sandboxPhases.orderIndex))
    .limit(1);
  
  const nextOrderIndex = existingPhases.length > 0 ? existingPhases[0].orderIndex + 1 : 0;

  const [newPhase] = await db
    .insert(sandboxPhases)
    .values({
      sandboxId,
      title: data.title,
      description: data.description,
      milestones: data.milestones,
      allocatedHours: data.allocatedHours.toString(),
      orderIndex: nextOrderIndex,
    })
    .returning();

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
  return newPhase;
}

export async function updatePhase(phaseId: string, sandboxId: string, data: { title: string; description: string; milestones: string[]; allocatedHours: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const [updatedPhase] = await db
    .update(sandboxPhases)
    .set({
      title: data.title,
      description: data.description,
      milestones: data.milestones,
      allocatedHours: data.allocatedHours.toString(),
    })
    .where(eq(sandboxPhases.id, phaseId))
    .returning();

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
  return updatedPhase;
}

export async function deletePhase(phaseId: string, sandboxId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.delete(sandboxPhases).where(eq(sandboxPhases.id, phaseId));

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
}

// Log Actions

export async function logSession(sandboxId: string, phaseId: string, data: { title: string; startTime: Date; endTime: Date; duration: number }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Insert Log
  const [newLog] = await db
    .insert(sandboxLogs)
    .values({
      phaseId,
      title: data.title,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration.toString(),
    })
    .returning();

  // Update Sandbox Current Hours
  // We can do this efficiently with SQL increment or by summing up. 
  // Incrementing is faster but summing is safer against drift.
  // Given we track all logs, let's just increment for now.
  
  await db
    .update(sandboxes)
    .set({
      currentHours: sql`${sandboxes.currentHours} + ${data.duration.toString()}`,
    })
    .where(eq(sandboxes.id, sandboxId));

  revalidatePath(`/dashboard/sandbox/${sandboxId}`);
  return newLog;
}
