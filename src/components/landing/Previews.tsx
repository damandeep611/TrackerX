"use client";

import { CalendarCheck, Clock, Flag } from "lucide-react";
import { ConsistencyCard } from "@/components/dashboard/home/ConsistencyCard";
import { MilestoneDial } from "@/components/dashboard/sandbox/MilestoneDial";
import SkillCard from "@/components/dashboard/skillcardComponents/skill-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { percentChange } from "@/lib/insights";
import { cn } from "@/lib/utils";
import { demoInsights, demoSandbox, demoSkill, demoSkillActivity, demoTakeaway } from "./demo-data";

/**
 * Real dashboard components with sample data. They're illustrations, so they
 * are inert (no focus, no clicks) and hidden from assistive tech; the
 * surrounding copy describes them.
 */
function Inert({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div inert aria-hidden className={cn("select-none", className)}>
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  );
}

const { last7, consistency, streak } = demoInsights;

/** The hero: a slice of the home dashboard. */
export function DashboardPreview() {
  return (
    <Inert>
      <div className="rounded-3xl border border-border bg-background/60 p-2 shadow-raised backdrop-blur-sm sm:p-3">
        <div className="rounded-2xl border border-border/60 bg-background p-4 sm:p-6">
          <p className="text-xs text-muted-foreground">Thursday, March 12</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">Welcome back</p>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{demoTakeaway}</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SkillCard skill={demoSkill} activity={demoSkillActivity} today={demoInsights.today} />
            <StatCard
              icon={<Clock />}
              title="Last 7 days"
              value={last7.minutes / 60}
              decimals={1}
              unit="h"
              sparkline={last7.daily}
              delta={percentChange(last7.minutes, last7.prevMinutes)}
              deltaLabel="vs prior 7 days"
              className="hidden md:flex"
            />
            <StatCard
              icon={<CalendarCheck />}
              title="Consistency"
              value={(consistency.activeDays / consistency.windowDays) * 100}
              unit="%"
              sparkline={consistency.weekly}
              color="var(--chart-4)"
              caption={`${consistency.activeDays} of ${consistency.windowDays} days · streak ${streak.current}d`}
              className="hidden md:flex"
            />
          </div>
        </div>
      </div>
    </Inert>
  );
}

/** Quick-log chips as they appear on a task or sandbox. */
export function QuickLogPreview() {
  return (
    <Inert>
      <Card>
        <Well className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-foreground">Ownership &amp; borrowing exercises</span>
          <span className="flex gap-1">
            {["+15m", "+30m", "+1h"].map((l) => (
              <Button key={l} size="xs" variant="outline" className="tabular px-2">
                {l}
              </Button>
            ))}
          </span>
        </Well>
      </Card>
    </Inert>
  );
}

/** The sandbox dial with named 20h milestones. */
export function SandboxPreview() {
  return (
    <Inert>
      <Card>
        <CardHeader>
          <CardTitle>
            <Flag />
            {demoSandbox.name}
          </CardTitle>
        </CardHeader>
        <Well className="grid items-center gap-6 px-6 py-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <MilestoneDial
            targetHours={demoSandbox.targetHours}
            totalMinutes={demoSandbox.totalMinutes}
            markers={demoSandbox.markers}
            activeMark={null}
            onSelectMarker={() => {}}
            className="max-w-[260px]"
          />
          <ol className="space-y-1.5 text-sm">
            {demoSandbox.markers.map((m) => (
              <li key={m.hourMark} className="flex items-center gap-3">
                <span
                  className={cn(
                    "size-2 shrink-0 rounded-full",
                    m.reached ? "bg-brand" : m.next ? "border-2 border-brand" : "bg-border-strong"
                  )}
                />
                <span className="tabular w-10 text-muted-foreground">{m.hourMark}h</span>
                <span className={cn("truncate", m.label ? "text-foreground" : "text-subtle-foreground")}>
                  {m.label ?? "Unnamed"}
                </span>
              </li>
            ))}
          </ol>
        </Well>
      </Card>
    </Inert>
  );
}

/** The 28-day consistency grid from the home dashboard. */
export function ConsistencyPreview() {
  return (
    <Inert>
      <ConsistencyCard insights={demoInsights} />
    </Inert>
  );
}
