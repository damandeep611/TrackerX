import { getSkillTasksForSkill } from "@/actions/skillTaskAction";
import { requireUser } from "@/lib/require-user";
import { db } from "@/db/drizzle";
import { skillCard } from "@/db/schema/schema";
import { and, eq } from "drizzle-orm";
import React from "react";
import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { subDays, addDays } from "date-fns";
import { getCurrentHours } from "@/actions/skillCardAction";
import { getTimeLogsByDateForSkill, getTotalTimeForTasks } from "@/actions/timeLogAction";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
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

  // Prefill React Query so the timeline and task totals render without a loading flash.
  // Keys must match the client hooks in hooks/useSkills.ts.
  const queryClient = getQueryClient();
  const taskIds = skillTodoData.map((t) => t.id).sort();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.skills.timeByDate(skill.id),
      queryFn: () => getTimeLogsByDateForSkill(skill.id, subDays(new Date(), 3), addDays(new Date(), 7)),
    }),
    taskIds.length > 0 &&
      queryClient.prefetchQuery({
        queryKey: queryKeys.skills.taskTotals(skill.id, taskIds),
        queryFn: () => getTotalTimeForTasks(taskIds),
      }),
  ]);

  return {
    status: "ok" as const,
    skill,
    skillTodoData,
    skillCurrentHours,
    dehydratedState: dehydrate(queryClient),
  };
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
  if (result.status === "not-found") notFound();

  const { skill, skillTodoData, skillCurrentHours, dehydratedState } = result;
  return (
    <HydrationBoundary state={dehydratedState}>
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
    </HydrationBoundary>
  );
}
