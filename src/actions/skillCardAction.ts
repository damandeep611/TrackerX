"use server";
import { db } from "@/db/drizzle";
import { skillCard, skillTask, timeLog } from "@/db/schema/schema";
import { and, eq, like, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { requireUser } from "@/lib/require-user";
import { parseInput, zId, zOptionalText, zText } from "@/lib/validation";

const zSlug = z.string().trim().min(1).max(200);

const skillCardInput = z.object({
  skillName: zText(100),
  category: zText(60),
  targetHours: z.number().min(1).max(100_000),
  skillColor: z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Invalid color"),
  description: zOptionalText(1000),
});

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
  const userId = await requireUser();

  // Get all skills for the user and calculate current hours from time logs
  const skills = await db
    .select()
    .from(skillCard)
    .where(eq(skillCard.userId, userId))
    .then((skills) =>
      skills.map((skill) => ({
        ...skill,
        createdAt: skill.createdAt.toISOString(),
      }))
    );

  // Calculate current hours from time logs for each skill
  const skillsWithCalculatedHours = await Promise.all(
    skills.map(async (skill) => {
      // Calculate total minutes from time logs for this skill
      const timeLogResult = await db
        .select({
          totalMinutes:
            sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(Number),
        })
        .from(timeLog)
        .where(
          and(
            eq(timeLog.skill_id, skill.id),
            eq(timeLog.user_id, userId)
          )
        );

      const timeLogMinutes = timeLogResult[0]?.totalMinutes || 0;
      const calculatedHours = timeLogMinutes / 60.0;

      return {
        ...skill,
        currentHours: calculatedHours,
      };
    })
  );

  return skillsWithCalculatedHours;
}

export async function getCurrentHours(slug: string) {
  const userId = await requireUser();
  slug = parseInput(zSlug, slug);

  try {
    // Get the skill ID from the slug and calculate current hours from time logs
    const skill = await db
      .select({ id: skillCard.id })
      .from(skillCard)
      .where(
        and(eq(skillCard.slug, slug), eq(skillCard.userId, userId))
      )
      .limit(1);

    if (!skill || skill.length === 0) {
      return "0.0";
    }

    const skillId = skill[0].id;

    // Calculate total minutes from time logs for this skill
    const timeLogResult = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .where(
        and(eq(timeLog.skill_id, skillId), eq(timeLog.user_id, userId))
      );

    const timeLogMinutes = timeLogResult[0]?.totalMinutes || 0;
    const calculatedHours = timeLogMinutes / 60.0;

    return calculatedHours.toFixed(1);
  } catch (error) {
    console.error("Error calculating current hours:", error);
    return "0.0";
  }
}

// Get skill by slug
export async function getSkillBySlug(slug: string) {
  const userId = await requireUser();
  slug = parseInput(zSlug, slug);

  const skills = await db
    .select()
    .from(skillCard)
    .where(
      and(eq(skillCard.slug, slug), eq(skillCard.userId, userId))
    );

  return skills[0];
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

  const slug = await generateSlug(input.skillName);

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

  // Delete all related time logs first
  await db
    .delete(timeLog)
    .where(and(eq(timeLog.skill_id, id), eq(timeLog.user_id, userId)));

  // Delete all related skill tasks
  await db
    .delete(skillTask)
    .where(
      and(eq(skillTask.skill_id, id), eq(skillTask.user_id, userId))
    );

  // Finally delete the skill card
  await db
    .delete(skillCard)
    .where(and(eq(skillCard.id, id), eq(skillCard.userId, userId)));

  return { success: true };
}
