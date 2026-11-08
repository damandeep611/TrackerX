"use server";
import { db } from "@/db/drizzle";
import { skillCard, timeLog } from "@/db/schema/schema";
import { and, eq, getTableColumns, like, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { parseInput, zId, zOptionalText, zText } from "@/lib/validation";

const skillCardInput = z.object({
  skillName: zText(100),
  category: zText(60),
  targetHours: z.number().min(1).max(100_000),
  skillColor: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Invalid color"),
  description: zOptionalText(1000),
});

// Generate a slug that is unique among this user's skills.
async function generateSlug(skillName: string, userId: string): Promise<string> {
  const baseSlug =
    skillName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "skill";

  const existingSkills = await db
    .select({ id: skillCard.id })
    .from(skillCard)
    .where(and(eq(skillCard.userId, userId), like(skillCard.slug, `${baseSlug}%`)))
    .limit(1);

  if (existingSkills.length === 0) {
    return baseSlug;
  }

  // If we have existing skills with similar slugs, append a unique identifier
  const uniqueId = uuidv4().split("-")[0]; // Take first part of UUID
  return `${baseSlug}-${uniqueId}`;
}

export async function getSkillCard() {
  const userId = await requireUser();

  // One query: per-skill minute totals joined onto the user's skills (PERF-01).
  const totals = db
    .select({
      skillId: timeLog.skill_id,
      minutes: sql<number>`sum(${timeLog.minutes})`.as("minutes"),
    })
    .from(timeLog)
    .where(eq(timeLog.user_id, userId))
    .groupBy(timeLog.skill_id)
    .as("totals");

  const rows = await db
    .select({
      ...getTableColumns(skillCard),
      totalMinutes: sql<number>`coalesce(${totals.minutes}, 0)`.mapWith(Number),
    })
    .from(skillCard)
    .leftJoin(totals, eq(totals.skillId, skillCard.id))
    .where(eq(skillCard.userId, userId))
    .orderBy(skillCard.createdAt);

  return rows.map(({ totalMinutes, ...skill }) => ({
    ...skill,
    createdAt: skill.createdAt.toISOString(),
    currentHours: totalMinutes / 60,
  }));
}

//adding skill card
export async function addSkillCard(data: {
  skillName: string;
  category: string;
  targetHours: number;
  skillColor: string;
  description?: string;
}) {
  const userId = await requireUser();
  const input = parseInput(skillCardInput, data);

  const slug = await generateSlug(input.skillName, userId);

  await db.insert(skillCard).values({
    skillName: input.skillName,
    category: input.category,
    targetHours: Math.floor(input.targetHours),
    currentHours: "0.00",
    skillColor: input.skillColor,
    description: input.description,
    createdAt: new Date(),
    slug,
    userId,
  });
}

export async function deleteSkillCard(id: string) {
  const userId = await requireUser();
  id = parseInput(zId, id);

  // Tasks and time logs are removed by ON DELETE CASCADE (PERF-07).
  await db
    .delete(skillCard)
    .where(and(eq(skillCard.id, id), eq(skillCard.userId, userId)));

  return { success: true };
}
