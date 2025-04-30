"use server";
import { db } from "@/db/drizzle";
import { skillCard } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { and, eq, like } from "drizzle-orm";
import { headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";

// Function to generate a slug from skill name
async function generateSlug(skillName: string): Promise<string> {
  const baseSlug = skillName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Check if a skill with this base slug exists
  const existingSkills = await db
    .select()
    .from(skillCard)
    .where(like(skillCard.slug, `${baseSlug}%`));

  if (existingSkills.length === 0) {
    return baseSlug;
  }

  // If we have existing skills with similar slugs, append a unique identifier
  const uniqueId = uuidv4().split("-")[0]; // Take first part of UUID
  return `${baseSlug}-${uniqueId}`;
}

export async function getSkillCard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const skills = await db
    .select()
    .from(skillCard)
    .where(eq(skillCard.userId, session.user.id));

  return skills.map((skill) => ({
    ...skill,
    currentHours: parseFloat(skill.currentHours),
  }));
}

// Get skill by slug
export async function getSkillBySlug(slug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const skills = await db
    .select()
    .from(skillCard)
    .where(
      and(eq(skillCard.slug, slug), eq(skillCard.userId, session.user.id))
    );

  return skills[0];
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

  const slug = await generateSlug(skillName);

  await db.insert(skillCard).values({
    skillName,
    category,
    targetHours: Math.floor(targetHours),
    currentHours: "0.00",
    skillColor,
    slug,
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
