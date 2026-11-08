"use client";

import Link, { useLinkStatus } from "next/link";
import { ArrowUpRight, Box, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, Well } from "@/components/ui/card";
import { BarSparkline, SegmentedProgress } from "@/components/ui/metric";
import { daysBetween, formatHours, splitHours } from "@/lib/insights";
import { markerStep } from "@/lib/milestones";
import type { SandboxSummary } from "@/types/sandbox";
import { QuickLogChips } from "./QuickLog";

function lastLoggedText(lastLogged: string | null, today: string) {
  if (!lastLogged) return "No sessions yet";
  const d = daysBetween(lastLogged, today);
  if (d <= 0) return "Logged today";
  if (d === 1) return "Logged yesterday";
  return `Last logged ${d} days ago`;
}

/**
 * A sandbox on the list page. The title is a stretched link over the whole
 * card (prefetch + pending state); the quick-log chips sit above it so one tap
 * logs time without opening the sandbox.
 */
export function SandboxCard({ sandbox, today }: { sandbox: SandboxSummary; today: string }) {
  const hours = sandbox.totalMinutes / 60;
  const pct = sandbox.targetHours > 0 ? (hours / sandbox.targetHours) * 100 : 0;
  const done = hours >= sandbox.targetHours;
  const total = splitHours(sandbox.totalMinutes);
  const step = markerStep(sandbox.targetHours);
  const markers = Array.from({ length: Math.floor(sandbox.targetHours / step) }, (_, i) => (i + 1) * step);
  const reached = Math.floor(hours / step);
  const toNext = done ? 0 : (reached + 1) * step * 60 - sandbox.totalMinutes;

  return (
    <Card
      interactive
      className="relative h-full overflow-hidden has-[[data-pending=true]]:border-border-strong has-[[data-pending=true]]:shadow-raised"
    >
      <div className="flex items-start gap-3 px-2.5 pt-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand" aria-hidden>
          <Box className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">
            <Link
              href={`/dashboard/sandbox/${sandbox.id}`}
              className="group/link flex items-center gap-1.5 rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-[3px] focus-visible:after:ring-ring"
            >
              <span className="truncate">{sandbox.name}</span>
              <PendingIcon />
            </Link>
          </h3>
          <p className="truncate text-xs text-muted-foreground">
            {lastLoggedText(sandbox.lastLogged, today)}
          </p>
        </div>
        {done ? (
          <Badge variant="brand" size="sm">
            Completed
          </Badge>
        ) : sandbox.minutes7d > 0 ? (
          <Badge variant="success" size="sm" dot>
            Active
          </Badge>
        ) : null}
      </div>

      <Well className="space-y-3 py-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="tabular text-2xl font-medium text-foreground">{total.value}</span>
            <span className="text-sm text-muted-foreground">
              {total.unit}
              <span className="text-subtle-foreground"> / {sandbox.targetHours}h</span>
            </span>
          </div>
          <span className="tabular text-sm text-muted-foreground">{Math.min(pct, 100).toFixed(0)}%</span>
        </div>
        <SegmentedProgress
          value={hours}
          max={sandbox.targetHours}
          segments={32}
          height={22}
          markers={markers}
          label={`${sandbox.name} progress`}
        />
        <p className="tabular text-xs text-muted-foreground">
          {done
            ? "Target reached"
            : markers.length > 0
              ? `${formatHours(toNext)} to the ${(reached + 1) * step}h milestone`
              : `${formatHours(sandbox.targetHours * 60 - sandbox.totalMinutes)} to go`}
        </p>
      </Well>

      <div className="flex items-center justify-between gap-3 px-2.5 pb-2">
        {/* relative z-10: above the stretched link, so chips log instead of navigating. */}
        <QuickLogChips sandboxId={sandbox.id} sandboxName={sandbox.name} className="relative z-10" />
        <BarSparkline
          data={sandbox.daily14}
          height={24}
          label={`${sandbox.name}: minutes per day, last 14 days`}
          className="shrink-0"
        />
      </div>
    </Card>
  );
}

/** Must render inside the <Link> to read its pending state. */
function PendingIcon() {
  const { pending } = useLinkStatus();
  return pending ? (
    <Loader2 data-pending="true" className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
  ) : (
    <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/link:opacity-100" />
  );
}
