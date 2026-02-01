"use server";

import { db } from "@/db/drizzle";
import { sandboxes } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

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
