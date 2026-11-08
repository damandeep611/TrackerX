import { notFound } from "next/navigation";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { skillCard } from "@/db/schema/schema";
import { getSkillTasks } from "@/actions/skillTaskAction";
import { getSkillInsights, getTagSuggestions } from "@/actions/skillInsightsAction";
import SkillPage from "@/components/dashboard/skill-page/SkillPage";
import { getQueryClient } from "@/lib/query-client";
import { queryKeys } from "@/lib/query-keys";
import { requirePageUser } from "@/lib/require-user";

export default async function SkillRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Outside prefetchQuery: keeps the route dynamic and fails fast when signed out.
  const userId = await requirePageUser(`/dashboard/skills/${slug}`);

  const [skill] = await db
    .select({
      id: skillCard.id,
      skillName: skillCard.skillName,
      slug: skillCard.slug,
      category: skillCard.category,
      description: skillCard.description,
      targetHours: skillCard.targetHours,
      skillColor: skillCard.skillColor,
    })
    .from(skillCard)
    .where(and(eq(skillCard.slug, slug), eq(skillCard.userId, userId)))
    .limit(1);
  if (!skill) notFound();

  // Prefill React Query so the page renders with data on first paint.
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({ queryKey: queryKeys.skills.tasks(skill.id), queryFn: () => getSkillTasks(skill.id) }),
    queryClient.prefetchQuery({ queryKey: queryKeys.skills.insights(skill.id), queryFn: () => getSkillInsights(skill.id) }),
    queryClient.prefetchQuery({ queryKey: queryKeys.skills.tagSuggestions(skill.id), queryFn: () => getTagSuggestions(skill.id) }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SkillPage skill={skill} />
    </HydrationBoundary>
  );
}
