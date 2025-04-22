"use server";
import { db } from "@/db/drizzle";
import { skillCard } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function getSkillCard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  return db
    .select()
    .from(skillCard)
    .where(eq(skillCard.userId, session.user.id));
}

//adding skill card
export async function addSkillCard({
  skillName,
  category,
  targetHours,
  skillColor,
}: {
  skillName: string;
  category: string;
  targetHours: number;
  skillColor: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  await db.insert(skillCard).values({
    skillName,
    category,
    targetHours,
    currentHours: 0, // Initialize with a default value
    skillColor,
    userId: session.user.id,
  });
}

export async function deleteSkillCard(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  await db
    .delete(skillCard)
    .where(and(eq(skillCard.id, id), eq(skillCard.userId, session.user.id)));
}
