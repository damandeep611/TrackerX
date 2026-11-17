"use client";

import { motion } from "motion/react";
import { CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/duration";
import { fadeIn } from "@/lib/motion";
import { relativeDayLabel } from "@/lib/tracker";
import type { TrackerCarryIn } from "@/types/tracker";

/** Offered when a new day opens: the previous day's carried + planned tasks. Nothing is added silently. */
export function CarryInBanner({
  carryIn,
  today,
  onImport,
  onDismiss,
}: {
  carryIn: TrackerCarryIn;
  today: string;
  onImport: () => void;
  onDismiss: () => void;
}) {
  const titles = [...carryIn.planned.map((t) => t.title), ...carryIn.carried.map((t) => t.title)];
  const unique = [...new Map(titles.map((t) => [t.toLowerCase(), t])).values()];
  const minutes =
    carryIn.planned.reduce((a, t) => a + (t.estimateMinutes ?? 0), 0) +
    carryIn.carried
      .filter((c) => !carryIn.planned.some((p) => p.title.toLowerCase() === c.title.toLowerCase()))
      .reduce((a, t) => a + (t.estimateMinutes ?? 0), 0);
  const from = relativeDayLabel(carryIn.fromDate, today).toLowerCase();

  const parts = [
    carryIn.planned.length > 0 && `${carryIn.planned.length} planned`,
    carryIn.carried.length > 0 && `${carryIn.carried.length} carried over`,
  ].filter(Boolean);

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-3 rounded-2xl border border-brand/25 bg-brand-soft/60 p-3.5 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-brand shadow-panel dark:bg-surface-3">
          <CornerDownRight className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            {unique.length} task{unique.length === 1 ? "" : "s"} from {from}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {parts.join(", ")}
              {minutes > 0 && ` · ${formatDuration(minutes)}`}
            </span>
          </p>
          <p className="truncate text-xs text-muted-foreground">{unique.join(" · ")}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 pl-11 sm:pl-0">
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Not today
        </Button>
        <Button size="sm" variant="brand" onClick={onImport}>
          Add to today
        </Button>
      </div>
    </motion.div>
  );
}
