import { getSkillTasksForSkill, getUserId } from "@/actions/skillTaskAction";
import ActivityTimeline from "@/components/dashboard/skilltodos/ActivityTimeline";
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
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="flex items-center justify-between w-full px-4 sm:px-8 py-3 border-b dark:border-gray-700 bg-background/95 dark:bg-black/90 backdrop-blur-sm ">
          <div>
            <h2 className="text-2xl ">{currentSkill.skillName}</h2>
          </div>
          <div>
            <ActivityTimeline skillId={skillId} />
          </div>
        </div>
        {/* Main Content Area (Scrollable) */}
        <div className="flex-grow overflow-hidden p-2  ">
          {/* Layout: Grid for larger screens, stack on smaller */}
          <div className="h-full">
            {/* Task List Column (Takes more space) */}
            <div className="lg:col-span-2 h-full overflow-y-auto pr-2">
              <SkillTodoList
                initialSkillTodos={skillTodoData}
                skillId={skillId}
                skillSlug={currentSkillSlug}
              />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error Fetching skills:", error);
    return <div>Error loading skill please try again</div>;
  }
}
