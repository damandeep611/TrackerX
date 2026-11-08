"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, Box, ChevronLeft, Gauge, MoreHorizontal, Timer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle, Well } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSandboxLogs, useSandboxOverview, useSandboxResources } from "@/hooks/useSandbox";
import {
  buildSkillTakeaway,
  formatDay,
  formatHours,
  projectEta,
  weeklyPace,
} from "@/lib/insights";
import { buildMarkers } from "@/lib/milestones";
import type { SandboxOverview } from "@/types/sandbox";
import { MilestoneDial } from "./MilestoneDial";
import { MilestoneList } from "./MilestoneList";
import { QuickLogPanel } from "./QuickLog";
import { ResourcesPanel } from "./ResourcesPanel";
import { SandboxInsightsTab } from "./SandboxInsightsTab";
import { DeleteSandboxDialog } from "./SandboxDialogs";
import { SessionList } from "./SessionList";

/** /dashboard/sandbox/[id]: the dial with named 20h milestones, quick logging, sessions, insights, resources. */
export default function SandboxDetailView({ sandboxId }: { sandboxId: string }) {
  const overview = useSandboxOverview(sandboxId);

  if (overview.data === null) {
    return (
      <PageShell>
        <EmptyState
          icon={<Box />}
          title="Sandbox not found"
          description="It may have been deleted."
          action={
            <Button variant="outline" asChild>
              <Link href="/dashboard/sandbox">Back to sandboxes</Link>
            </Button>
          }
        />
      </PageShell>
    );
  }
  if (!overview.data) {
    return (
      <PageShell>
        {overview.isError ? (
          <LoadError what="this sandbox" onRetry={() => overview.refetch()} />
        ) : (
          <Skeleton className="h-96 rounded-2xl" />
        )}
      </PageShell>
    );
  }
  return <Loaded overview={overview.data} />;
}

function Loaded({ overview }: { overview: SandboxOverview }) {
  const { sandbox, insights, milestones } = overview;
  const logsQuery = useSandboxLogs(sandbox.id);
  const resourcesQuery = useSandboxResources(sandbox.id);
  const logs = logsQuery.data ?? [];
  const resources = resourcesQuery.data ?? [];

  const [editingMark, setEditingMark] = useState<number | null>(null);
  const durationRef = useRef<HTMLInputElement>(null);

  // L jumps to the custom-duration field (unless you're typing somewhere).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "l" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      e.preventDefault();
      durationRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const markers = buildMarkers(sandbox.targetHours, insights.totalMinutes, milestones);
  const eta = projectEta(insights, sandbox.targetHours);
  const pace = weeklyPace(insights);

  const stats = [
    { label: "This week", value: formatHours(insights.last7.minutes) },
    {
      label: "Streak",
      value: `${insights.streak.current} ${insights.streak.current === 1 ? "day" : "days"}`,
    },
    {
      label: "Finish",
      value: eta.remainingMinutes === 0 ? "Reached" : eta.date ? formatDay(eta.date, insights.today) : "—",
    },
  ];

  return (
    <TooltipProvider>
      <PageShell>
        <PageHeader
          eyebrow={
            <Link
              href="/dashboard/sandbox"
              className="inline-flex items-center gap-0.5 rounded-sm hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
            >
              <ChevronLeft className="size-3.5" aria-hidden />
              Sandboxes
            </Link>
          }
          title={sandbox.name}
          description={buildSkillTakeaway(
            insights,
            sandbox.targetHours,
            "No sessions yet. Finish a block of work, then log it with one tap."
          )}
          actions={<SandboxMenu sandbox={sandbox} />}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                <Gauge />
                Progress
              </CardTitle>
            </CardHeader>
            <Well className="flex flex-1 items-center justify-center px-8 py-8 sm:px-12">
              <MilestoneDial
                targetHours={sandbox.targetHours}
                totalMinutes={insights.totalMinutes}
                markers={markers}
                activeMark={editingMark}
                onSelectMarker={setEditingMark}
              />
            </Well>
            <CardFooter className="pb-2">
              <dl className="grid w-full grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs text-muted-foreground">{s.label}</dt>
                    <dd className="tabular mt-0.5 text-sm text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </CardFooter>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Timer />
                  Log a session
                </CardTitle>
              </CardHeader>
              <Well>
                {logsQuery.isPending ? (
                  <Skeleton className="h-32 rounded-lg" />
                ) : (
                  <QuickLogPanel
                    sandboxId={sandbox.id}
                    sandboxName={sandbox.name}
                    lastTitle={logs.find((l) => l.title)?.title ?? null}
                    durationRef={durationRef}
                  />
                )}
              </Well>
            </Card>
            <MilestoneList
              sandboxId={sandbox.id}
              markers={markers}
              totalMinutes={insights.totalMinutes}
              weeklyMinutes={pace}
              today={insights.today}
              editing={editingMark}
              onEditingChange={setEditingMark}
            />
          </div>
        </div>

        <Tabs defaultValue="sessions" className="gap-5">
          <TabsList>
            <TabsTrigger value="sessions" className="gap-1.5">
              Sessions
              {logs.length > 0 && <span className="tabular text-subtle-foreground">{logs.length}</span>}
            </TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="resources" className="gap-1.5">
              Resources
              {resources.length > 0 && (
                <span className="tabular text-subtle-foreground">{resources.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sessions">
            {logsQuery.isError ? (
              <LoadError what="sessions" onRetry={() => logsQuery.refetch()} />
            ) : logsQuery.isPending ? (
              <Skeleton className="h-60 rounded-2xl" />
            ) : (
              <SessionList sandboxId={sandbox.id} logs={logs} today={insights.today} />
            )}
          </TabsContent>

          <TabsContent value="insights">
            <SandboxInsightsTab insights={insights} logs={logs} targetHours={sandbox.targetHours} />
          </TabsContent>

          <TabsContent value="resources">
            {resourcesQuery.isError ? (
              <LoadError what="resources" onRetry={() => resourcesQuery.refetch()} />
            ) : resourcesQuery.isPending ? (
              <Skeleton className="h-60 rounded-2xl" />
            ) : (
              <ResourcesPanel sandboxId={sandbox.id} resources={resources} />
            )}
          </TabsContent>
        </Tabs>
      </PageShell>
    </TooltipProvider>
  );
}

function SandboxMenu({ sandbox }: { sandbox: { id: string; name: string } }) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Sandbox options">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}>
            <Trash2 />
            Delete sandbox
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteSandboxDialog
        sandbox={sandbox}
        open={confirm}
        onOpenChange={setConfirm}
        redirectTo="/dashboard/sandbox"
      />
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
