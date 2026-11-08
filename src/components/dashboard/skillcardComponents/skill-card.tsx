"use client";

import Link, { useLinkStatus } from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, Well } from "@/components/ui/card";
import { BarSparkline, SegmentedProgress } from "@/components/ui/metric";
import { cn } from "@/lib/utils";
import { daysBetween, formatHours, splitHours, type SkillActivity } from "@/lib/insights";
import { tint } from "@/lib/skill-colors";
import type { SkillListItem } from "@/hooks/useSkills";

export type SkillStatus = "active" | "idle" | "new" | "done";

export function getSkillStatus(skill: SkillListItem, activity?: SkillActivity): SkillStatus {
  if (skill.targetHours > 0 && skill.currentHours >= skill.targetHours) return "done";
  if ((activity?.minutes7d ?? 0) > 0) return "active";
  if (!activity?.lastLogged) return "new";
  return "idle";
}

const STATUS_BADGE = {
  active: { label: "Active", variant: "success" },
  idle: { label: "Idle", variant: "neutral" },
  new: { label: "Not started", variant: "outline" },
  done: { label: "Completed", variant: "brand" },
} as const;

function lastLoggedText(lastLogged: string | null | undefined, today: string) {
  if (!lastLogged) return "No time logged yet";
  const d = daysBetween(lastLogged, today);
  if (d <= 0) return "Logged today";
  if (d === 1) return "Logged yesterday";
  return `Last logged ${d} days ago`;
}

export default function SkillCard({
  skill,
  activity,
  today,
}: {
  skill: SkillListItem;
  activity?: SkillActivity;
  today: string;
}) {
  return (
    <Link
      href={`/dashboard/skills/${skill.slug}`}
      className="group block rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
    >
      <SkillCardBody skill={skill} activity={activity} today={today} />
    </Link>
  );
}

/** Rendered inside the <Link> so it can read the link's pending state. */
function SkillCardBody({
  skill,
  activity,
  today,
}: {
  skill: SkillListItem;
  activity?: SkillActivity;
  today: string;
}) {
  const { pending } = useLinkStatus();
  const color = skill.skillColor;
  const status = getSkillStatus(skill, activity);
  const badge = STATUS_BADGE[status];
  const pct = skill.targetHours > 0 ? (skill.currentHours / skill.targetHours) * 100 : 0;
  const remaining = Math.max(skill.targetHours - skill.currentHours, 0);
  const week = activity?.minutes7d ?? 0;
  const total = splitHours(skill.currentHours * 60);

  return (
    <Card
      interactive
      aria-busy={pending}
      className={cn(
        "relative h-full overflow-hidden",
        pending && "border-border-strong shadow-raised"
      )}
    >
      {/* Pending bar: instant feedback while the skill page loads. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 opacity-0 transition-[transform,opacity] duration-700 ease-out",
          pending && "scale-x-90 opacity-100"
        )}
        style={{ background: color }}
      />

      <div className="flex items-start gap-3 px-2.5 pt-2">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
          style={{ background: tint(color), color }}
          aria-hidden
        >
          {skill.skillName.trim().charAt(0).toUpperCase() || "?"}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-1.5 truncate text-sm font-semibold text-foreground">
            <span className="truncate">{skill.skillName}</span>
            {pending ? (
              <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            )}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{skill.category}</p>
        </div>
        <Badge variant={badge.variant} size="sm" dot={status === "active"}>
          {badge.label}
        </Badge>
      </div>

      <Well className="space-y-3 py-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="tabular text-2xl font-medium text-foreground">{total.value}</span>
            <span className="text-sm text-muted-foreground">
              {total.unit}
              <span className="text-subtle-foreground"> / {skill.targetHours}h</span>
            </span>
          </div>
          <span className="tabular text-sm text-muted-foreground">{Math.min(pct, 100).toFixed(0)}%</span>
        </div>
        <SegmentedProgress
          value={skill.currentHours}
          max={skill.targetHours}
          segments={32}
          height={22}
          color={color}
          label={`${skill.skillName} progress`}
        />
      </Well>

      <div className="flex items-end justify-between gap-3 px-2.5 pb-2">
        <div className="min-w-0 text-xs">
          <p className="text-foreground">
            {week > 0 ? (
              <>
                <span className="tabular">{formatHours(week)}</span>
                <span className="text-muted-foreground"> this week</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {lastLoggedText(activity?.lastLogged, today)}
              </span>
            )}
          </p>
          <p className="truncate text-subtle-foreground">
            {status === "done" ? "Target reached" : `${formatHours(remaining * 60)} to go`}
          </p>
        </div>
        <BarSparkline
          data={activity?.daily14 ?? Array(14).fill(0)}
          color={color}
          height={24}
          label={`${skill.skillName}: minutes per day, last 14 days`}
        />
      </div>
    </Card>
  );
}
