"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ChevronLeft, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Card, Well } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedProgress } from "@/components/ui/metric";
import { PageHeader, PageShell } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSkillInsights, useSkillTasks } from "@/hooks/useSkillPage";
import { useDeleteSkillCard } from "@/hooks/useSkills";
import {
  buildSkillTakeaway,
  formatDay,
  projectEta,
  splitHours,
  formatHours,
  type SkillInsights,
} from "@/lib/insights";
import { tint } from "@/lib/skill-colors";
import { QuickAddTask } from "./QuickAddTask";
import { SkillInsightsTab } from "./SkillInsightsTab";
import { TaskList } from "./TaskList";

export type SkillMeta = {
  id: string;
  skillName: string;
  slug: string;
  category: string;
  description: string | null;
  targetHours: number;
  skillColor: string;
};

/** Skill page: log work on tasks (Work) and see how it's going (Insights). */
export default function SkillPage({ skill }: { skill: SkillMeta }) {
  const tasksQuery = useSkillTasks(skill.id);
  const insightsQuery = useSkillInsights(skill.id);
  const tasks = tasksQuery.data ?? [];
  const insights = insightsQuery.data;

  return (
    <TooltipProvider>
      <PageShell className="max-w-5xl">
        <PageHeader
          eyebrow={
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-0.5 rounded-sm hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
            >
              <ChevronLeft className="size-3.5" aria-hidden />
              Skills
              <span className="text-subtle-foreground"> · {skill.category}</span>
            </Link>
          }
          title={
            <span className="flex items-center gap-2.5">
              <span
                className="size-3 shrink-0 rounded-full"
                style={{ background: skill.skillColor, boxShadow: `0 0 0 4px ${tint(skill.skillColor, 18)}` }}
                aria-hidden
              />
              <span className="truncate">{skill.skillName}</span>
            </span>
          }
          description={insights ? buildSkillTakeaway(insights, skill.targetHours) : skill.description}
          actions={<SkillMenu skill={skill} />}
        />

        {insights ? <ProgressCard skill={skill} insights={insights} /> : <Skeleton className="h-32 rounded-2xl" />}

        <Tabs defaultValue="work" className="gap-5">
          <TabsList>
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="work" className="space-y-5">
            <QuickAddTask skillId={skill.id} />
            {tasksQuery.isError ? (
              <LoadError what="tasks" onRetry={() => tasksQuery.refetch()} />
            ) : tasksQuery.isPending ? (
              <Skeleton className="h-60 rounded-2xl" />
            ) : (
              <TaskList skillId={skill.id} tasks={tasks} />
            )}
          </TabsContent>

          <TabsContent value="insights">
            {insightsQuery.isError ? (
              <LoadError what="insights" onRetry={() => insightsQuery.refetch()} />
            ) : insights ? (
              <SkillInsightsTab
                insights={insights}
                tasks={tasks}
                targetHours={skill.targetHours}
                color={skill.skillColor}
              />
            ) : (
              <Skeleton className="h-80 rounded-2xl" />
            )}
          </TabsContent>
        </Tabs>
      </PageShell>
    </TooltipProvider>
  );
}

function ProgressCard({ skill, insights }: { skill: SkillMeta; insights: SkillInsights }) {
  const total = splitHours(insights.totalMinutes);
  const pct = skill.targetHours > 0 ? (insights.totalMinutes / 60 / skill.targetHours) * 100 : 0;
  const eta = projectEta(insights, skill.targetHours);
  // Milestone ticks every 20h (quarters for small targets).
  const step = skill.targetHours >= 60 ? 20 : Math.max(Math.round(skill.targetHours / 4), 1);
  const markers = Array.from({ length: Math.floor(skill.targetHours / step) }, (_, i) => (i + 1) * step);

  const stats = [
    { label: "This week", value: formatHours(insights.last7.minutes) },
    {
      label: "Streak",
      value: `${insights.streak.current} ${insights.streak.current === 1 ? "day" : "days"}`,
    },
    {
      label: "Finish",
      value:
        eta.remainingMinutes === 0 ? "Reached" : eta.date ? formatDay(eta.date, insights.today) : "—",
    },
  ];

  return (
    <Card>
      <Well className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="min-w-0 space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <div className="flex items-baseline gap-1">
              <span className="tabular text-[32px] leading-none font-medium text-foreground">{total.value}</span>
              <span className="text-sm text-muted-foreground">
                {total.unit} <span className="text-subtle-foreground">/ {skill.targetHours}h</span>
              </span>
            </div>
            <span className="tabular text-sm text-muted-foreground">{Math.min(pct, 100).toFixed(0)}%</span>
          </div>
          <SegmentedProgress
            value={insights.totalMinutes / 60}
            max={skill.targetHours}
            segments={48}
            height={26}
            markers={markers}
            color={skill.skillColor}
            label={`${skill.skillName} progress`}
          />
        </div>
        <dl className="grid grid-cols-3 gap-4 border-t border-border pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
          {stats.map((s) => (
            <div key={s.label} className="min-w-16">
              <dt className="text-xs text-muted-foreground">{s.label}</dt>
              <dd className="tabular mt-1 text-sm text-foreground">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Well>
    </Card>
  );
}

function SkillMenu({ skill }: { skill: SkillMeta }) {
  const router = useRouter();
  const deleteSkill = useDeleteSkillCard();
  const [confirm, setConfirm] = useState(false);

  const onDelete = async () => {
    try {
      await deleteSkill.mutateAsync(skill.id);
      toast.success(`${skill.skillName} deleted`);
      router.push("/dashboard");
    } catch {
      toast.error("Couldn't delete the skill. Please try again.");
      setConfirm(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Skill options">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
            <Trash2 />
            Delete skill
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirm} onOpenChange={(o) => !deleteSkill.isPending && setConfirm(o)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {skill.skillName}?</DialogTitle>
            <DialogDescription>
              All of its tasks and logged time are removed for good. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(false)} disabled={deleteSkill.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleteSkill.isPending}>
              Delete skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LoadError({ what, onRetry }: { what: string; onRetry: () => void }) {
  return (
    <EmptyState
      compact
      icon={<AlertCircle />}
      title={`Couldn't load ${what}`}
      action={
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      }
    />
  );
}
