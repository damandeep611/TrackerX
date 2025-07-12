import { getSkillTasksForSkill, getUserId } from "@/actions/skillTaskAction";
import { db } from "@/db/drizzle";
import { skillCard } from "@/db/schema/schema";
import { and, eq } from "drizzle-orm";
import React from "react";
import SkillHeader from "../SkillHeader";
import { getCurrentHours } from "@/actions/skillCardAction";
import SkillPageWrapper from "@/components/dashboard/skills/SkillPageWrapper";

export default async function SkillOverview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const skillSlug = resolvedParams.slug;
  const userId = await getUserId();

  if (!userId) {
    return <div>Authentication required..</div>; //handling not authenticated case,
  }

  try {
    //fetch the specific skill card for the current user using the slug
    const skill = await db
      .select({
        id: skillCard.id,
        skillName: skillCard.skillName,
        slug: skillCard.slug,
      })
      .from(skillCard)
      .where(and(eq(skillCard.slug, skillSlug), eq(skillCard.userId, userId)))
      .limit(1);

    if (!skill || skill.length === 0) return <div>Skill Not found...</div>;

    const currentSkill = skill[0];
    const skillId = currentSkill.id;
    const currentSkillSlug = currentSkill.slug; //slug for revalidation
    const skillTodoData = await getSkillTasksForSkill(skillId);
    const skillCurrentHours = await getCurrentHours(skillSlug);

    return (
      <div className="flex flex-col overflow-hidden">
        <SkillHeader skillSlug={currentSkillSlug} />
        <SkillPageWrapper
          initialSkillTodos={skillTodoData}
          skillId={skillId}
          skillCurrentHours={skillCurrentHours}
        />
      </div>
    );
  } catch (error) {
    console.error("Error Fetching skills:", error);
    return <div>Error loading skill please try again</div>;
  }
}
