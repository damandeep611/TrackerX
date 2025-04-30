import { getSkillTasksForSkill, getUserId } from "@/actions/skillTaskAction";
import SkillTodoList from "@/components/dashboard/skilltodos/skill-todo-list";
import { db } from "@/db/drizzle";
import { skillCard } from "@/db/schema/schema";
import { and, eq } from "drizzle-orm";
import React from "react";

export default async function SkillOverview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const skillSlug = resolvedParams.slug;
  const userId = await getUserId();

  if (!userId) {
    return <div>Authentication required..</div>;
  }

  try {
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
    const currentSkillSlug = currentSkill.slug;
    const skillTodoData = await getSkillTasksForSkill(skillId);
    return (
      // the skilloverview tasks to show here
      <div className=" relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className=" absolute top-2 left-1 px-8 pb-2 border-b border-gray-500 w-full">
          <h2 className="text-2xl font-bold">{currentSkill.skillName}</h2>
        </div>
        <div>
          <SkillTodoList
            initialSkillTodos={skillTodoData}
            skillId={skillId}
            skillSlug={currentSkillSlug}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error Fetching skills:", error);
    return <div>Error loading skill please try again</div>;
  }
}
