"use client";

import { useState } from "react";
import { AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { AddSkillDialog } from "@/components/dashboard/skillcardComponents/add-skill-dialog";
import { useDashboardInsights } from "@/hooks/useDashboardAnalytics";
import { useSkillCards } from "@/hooks/useSkills";
import { buildTakeaway } from "@/lib/insights";
import { ConsistencyCard } from "./ConsistencyCard";
import { KpiRow } from "./KpiRow";
import { SkillsSection } from "./SkillsSection";
import { TrendCard } from "./TrendCard";

export default function HomeDashboard({ firstName }: { firstName?: string }) {
  const [adding, setAdding] = useState(false);
  const skillsQuery = useSkillCards();
  const insightsQuery = useDashboardInsights();
  const skills = skillsQuery.data ?? [];
  const insights = insightsQuery.data;

  const categories = [...new Set(skills.map((s) => s.category))];
  const eyebrow = insights
    ? new Date(`${insights.today}T00:00:00Z`).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : undefined;

  return (
    <PageShell>
      <PageHeader
        eyebrow={eyebrow}
        title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        description={insights ? buildTakeaway(insights) : "Your skills at a glance."}
        actions={
          <Button variant="brand" onClick={() => setAdding(true)}>
            <Plus />
            New skill
          </Button>
        }
      />

      {insightsQuery.isError ? (
        <EmptyState
          compact
          icon={<AlertCircle />}
          title="Couldn't load your insights"
          action={
            <Button variant="outline" size="sm" onClick={() => insightsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : insights ? (
        <>
          <KpiRow insights={insights} skills={skills} />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <TrendCard insights={insights} />
            <ConsistencyCard insights={insights} />
          </div>
        </>
      ) : (
        <InsightsSkeleton />
      )}

      {skillsQuery.isError ? (
        <EmptyState
          compact
          icon={<AlertCircle />}
          title="Couldn't load your skills"
          action={
            <Button variant="outline" size="sm" onClick={() => skillsQuery.refetch()}>
              Try again
            </Button>
          }
        />
      ) : skillsQuery.isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <SkillsSection skills={skills} insights={insights} onAddSkill={() => setAdding(true)} />
      )}

      <AddSkillDialog open={adding} onOpenChange={setAdding} categories={categories} />
    </PageShell>
  );
}

function InsightsSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-2xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
      </div>
    </>
  );
}
