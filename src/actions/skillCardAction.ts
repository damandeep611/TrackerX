"use server";
import { db } from "@/db/drizzle";
import { skillCard, skillTask, timeLog } from "@/db/schema/schema";
import { auth } from "@/lib/auth";
import { and, eq, like, sql } from "drizzle-orm";
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

  // Get all skills for the user and calculate current hours from time logs
  const skills = await db
    .select()
    .from(skillCard)
    .where(eq(skillCard.userId, session.user.id))
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
            eq(timeLog.user_id, session.user.id)
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
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  try {
    // Get the skill ID from the slug and calculate current hours from time logs
    const skill = await db
      .select({ id: skillCard.id })
      .from(skillCard)
      .where(
        and(eq(skillCard.slug, slug), eq(skillCard.userId, session.user.id))
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
        and(eq(timeLog.skill_id, skillId), eq(timeLog.user_id, session.user.id))
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
  description,
}: {
  skillName: string;
  category: string;
  targetHours: number;
  skillColor: string;
  description?: string;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  const slug = await generateSlug(skillName);
  const now = new Date();

  await db.insert(skillCard).values({
    skillName,
    category,
    targetHours: Math.floor(targetHours),
    currentHours: "0.00",
    skillColor,
    description: description || null,
    createdAt: now,
    slug,
    userId: session.user.id,
  });
}

export async function deleteSkillCard(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  // Delete all related time logs first
  await db
    .delete(timeLog)
    .where(and(eq(timeLog.skill_id, id), eq(timeLog.user_id, session.user.id)));

  // Delete all related skill tasks
  await db
    .delete(skillTask)
    .where(
      and(eq(skillTask.skill_id, id), eq(skillTask.user_id, session.user.id))
    );

  // Finally delete the skill card
  await db
    .delete(skillCard)
    .where(and(eq(skillCard.id, id), eq(skillCard.userId, session.user.id)));

  return { success: true };
}

// Update skill card current hours based on time logs
export async function updateSkillCardHoursFromTimeLogs(
  skillId: string
): Promise<void> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) throw new Error("Not authenticated");

  try {
    // Calculate total minutes from time logs for this skill
    const timeLogResult = await db
      .select({
        totalMinutes: sql<number>`COALESCE(sum(${timeLog.minutes}), 0)`.mapWith(
          Number
        ),
      })
      .from(timeLog)
      .where(
        and(eq(timeLog.skill_id, skillId), eq(timeLog.user_id, session.user.id))
      );

    const timeLogMinutes = timeLogResult[0]?.totalMinutes || 0;
    const totalHours = timeLogMinutes / 60.0;

    await db
      .update(skillCard)
      .set({ currentHours: totalHours.toFixed(2) })
      .where(
        and(eq(skillCard.id, skillId), eq(skillCard.userId, session.user.id))
      );

    console.log(
      `Updated currentHours for skill ${skillId} to ${totalHours.toFixed(
        2
      )} (TimeLogs: ${timeLogMinutes}m)`
    );
  } catch (error) {
    console.error(`Failed to update hours for skill ${skillId}:`, error);
  }
}
