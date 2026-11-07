import { getSkillTasksForSkill } from "@/actions/skillTaskAction";
import { requireUser } from "@/lib/require-user";
import { db } from "@/db/drizzle";
import { skillCard } from "@/db/schema/schema";
import { and, eq } from "drizzle-orm";
import React from "react";
import { getCurrentHours } from "@/actions/skillCardAction";
import SkillPageWrapper from "@/components/dashboard/skills/SkillPageWrapper";

async function loadSkill(skillSlug: string, userId: string) {
  //fetch the specific skill card for the current user using the slug
  const [skill] = await db
    .select({
      id: skillCard.id,
      skillName: skillCard.skillName,
      slug: skillCard.slug,
      createdAt: skillCard.createdAt,
    })
    .from(skillCard)
    .where(and(eq(skillCard.slug, skillSlug), eq(skillCard.userId, userId)))
    .limit(1);

  if (!skill) return { status: "not-found" as const };

  const [skillTodoData, skillCurrentHours] = await Promise.all([
    getSkillTasksForSkill(skill.id),
    getCurrentHours(skillSlug),
  ]);

  return { status: "ok" as const, skill, skillTodoData, skillCurrentHours };
}

export default async function SkillOverview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: skillSlug } = await params;
  const userId = await requireUser();

  // Data loading happens outside JSX so errors can be caught without
  // wrapping rendering in try/catch (react-hooks/error-boundaries).
  let result: Awaited<ReturnType<typeof loadSkill>> | { status: "error" };
  try {
    result = await loadSkill(skillSlug, userId);
  } catch (error) {
    console.error("Error Fetching skills:", error);
    result = { status: "error" };
  }

  if (result.status === "error") return <div>Error loading skill please try again</div>;
  if (result.status === "not-found") return <div>Skill Not found...</div>;

  const { skill, skillTodoData, skillCurrentHours } = result;
  return (
    <div className="flex flex-col">
      <SkillPageWrapper
        skillName={skill.skillName}
        initialSkillTodos={skillTodoData}
        skillId={skill.id}
        skillCurrentHours={skillCurrentHours}
        skillSlug={skill.slug}
        createdAt={skill.createdAt}
      />
    </div>
  );
}
