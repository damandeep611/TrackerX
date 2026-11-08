"use client";

import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatHours, splitHours } from "@/lib/insights";
import { markerName, type Marker } from "@/lib/milestones";
import { cn } from "@/lib/utils";

const VIEW = 300;
const C = VIEW / 2;
const R = 112; // ring radius
const RING = 12; // ring thickness
const DOT_R = R + 26; // where the marker buttons sit

/** Angle (radians, 0 = top, clockwise) for an hour mark. */
const angleOf = (hours: number, target: number) => (hours / target) * 2 * Math.PI - Math.PI / 2;
const point = (radius: number, a: number) => ({ x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) });

/**
 * Progress ring toward the target hours, cut into segments by a marker every
 * 20h. Each marker is a button: hover shows its name, click selects it for
 * naming (handled by the milestone list next to the dial).
 */
export function MilestoneDial({
  targetHours,
  totalMinutes,
  markers,
  activeMark,
  onSelectMarker,
  className,
}: {
  targetHours: number;
  totalMinutes: number;
  markers: Marker[];
  activeMark: number | null;
  onSelectMarker: (hourMark: number) => void;
  className?: string;
}) {
  const ratio = targetHours > 0 ? Math.min(totalMinutes / 60 / targetHours, 1) : 0;
  const pct = targetHours > 0 ? (totalMinutes / 60 / targetHours) * 100 : 0;
  const total = splitHours(totalMinutes);
  const next = markers.find((m) => m.next);
  const toNext = next ? next.hourMark * 60 - totalMinutes : 0;

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-[320px]", className)}>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="size-full overflow-visible" aria-hidden>
        <circle cx={C} cy={C} r={R} fill="none" strokeWidth={RING} className="stroke-surface-3" />
        <motion.circle
          cx={C}
          cy={C}
          r={R}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={RING}
          strokeLinecap="round"
          transform={`rotate(-90 ${C} ${C})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: ratio }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ opacity: ratio > 0 ? 1 : 0 }}
        />
        {/* Marker cuts: a gap in the ring at every marker (the target sits at the top). */}
        {markers
          .filter((m) => m.hourMark < targetHours)
          .map((m) => {
            const a = angleOf(m.hourMark, targetHours);
            const p1 = point(R - RING / 2 - 1, a);
            const p2 = point(R + RING / 2 + 1, a);
            return (
              <line
                key={m.hourMark}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                strokeWidth={2.5}
                className="stroke-surface-2"
              />
            );
          })}
        {/* Fine inner scale. */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
          const p1 = point(R - RING - 6, a);
          const p2 = point(R - RING - (i % 5 === 0 ? 11 : 8), a);
          return (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              strokeWidth={1}
              strokeLinecap="round"
              className={i / 60 < ratio ? "stroke-muted-foreground/60" : "stroke-border-strong/60"}
            />
          );
        })}
      </svg>

      {/* Marker buttons (HTML, so they're focusable and get tooltips). */}
      {markers.map((m) => {
        const p = point(DOT_R, angleOf(m.hourMark, targetHours));
        const status = m.reached ? "reached" : m.next ? "next" : "ahead";
        return (
          <Tooltip key={m.hourMark}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onSelectMarker(m.hourMark)}
                aria-label={`Milestone ${markerName(m)}, ${status}. Click to name it.`}
                aria-pressed={activeMark === m.hourMark}
                className="group absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
                style={{ left: `${(p.x / VIEW) * 100}%`, top: `${(p.y / VIEW) * 100}%` }}
              >
                <span
                  className={cn(
                    "block rounded-full transition-transform duration-200 group-hover:scale-125",
                    m.label ? "size-3" : "size-2.5",
                    m.reached && "bg-brand",
                    m.next && "border-2 border-brand bg-card shadow-[0_0_0_4px_var(--brand-soft)]",
                    !m.reached && !m.next && "bg-border-strong",
                    m.label && !m.reached && !m.next && "border-2 border-muted-foreground bg-card",
                    activeMark === m.hourMark && "ring-2 ring-ring ring-offset-2 ring-offset-card"
                  )}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="tabular">{markerName(m)}</span>
              <span className="text-muted-foreground">
                {" "}
                · {m.reached ? "reached" : m.next ? `${formatHours(toNext)} to go` : "ahead"}
              </span>
            </TooltipContent>
          </Tooltip>
        );
      })}

      {/* Center readout. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs text-muted-foreground">Logged</span>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="tabular text-5xl leading-none font-medium tracking-tight text-foreground">
            {total.value}
          </span>
          <span className="text-base text-muted-foreground">{total.unit}</span>
        </div>
        <span className="tabular mt-1.5 text-sm text-muted-foreground">
          of {targetHours}h · {Math.min(pct, 100).toFixed(0)}%
        </span>
        {next ? (
          <span className="mt-3 max-w-[60%] truncate rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand">
            {next.label ? (
              <>
                <span className="tabular">{formatHours(toNext)}</span> to {next.label}
              </>
            ) : (
              <>
                Next milestone: <span className="tabular">{next.hourMark}h</span>
              </>
            )}
          </span>
        ) : (
          totalMinutes > 0 && (
            <span className="mt-3 rounded-full bg-success-soft px-2.5 py-1 text-xs text-success">
              Target reached
            </span>
          )
        )}
      </div>
    </div>
  );
}
