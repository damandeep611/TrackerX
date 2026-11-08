import { MILESTONE_STEP_HOURS, type SandboxMilestone } from "@/types/sandbox";

/** Most markers drawn on one dial; very large targets space them wider (still multiples of 20h). */
const MAX_MARKERS = 24;

export type Marker = {
  hourMark: number;
  label: string | null;
  reached: boolean;
  /** The first marker not reached yet. */
  next: boolean;
};

/** Hours between auto markers for a target: 20h, or a wider multiple of 20h for huge targets. */
export function markerStep(targetHours: number): number {
  const count = targetHours / MILESTONE_STEP_HOURS;
  return count <= MAX_MARKERS
    ? MILESTONE_STEP_HOURS
    : Math.ceil(count / MAX_MARKERS) * MILESTONE_STEP_HOURS;
}

/**
 * Auto markers every 20h up to (and including) the target, merged with the
 * named ones. Only named markers are stored; the rest are derived here.
 */
export function buildMarkers(
  targetHours: number,
  totalMinutes: number,
  named: SandboxMilestone[]
): Marker[] {
  const step = markerStep(targetHours);
  const marks = new Set<number>();
  for (let h = step; h <= targetHours; h += step) marks.add(h);
  for (const m of named) if (m.hourMark > 0 && m.hourMark <= targetHours) marks.add(m.hourMark);

  const labels = new Map(named.map((m) => [m.hourMark, m.label]));
  const hours = totalMinutes / 60;
  let nextFound = false;
  return [...marks]
    .sort((a, b) => a - b)
    .map((hourMark) => {
      const reached = hours >= hourMark;
      const next = !reached && !nextFound;
      if (next) nextFound = true;
      return { hourMark, label: labels.get(hourMark) ?? null, reached, next };
    });
}

/** "20h" or "20h · Ship the MVP". */
export function markerName(m: Pick<Marker, "hourMark" | "label">): string {
  return m.label ? `${m.hourMark}h · ${m.label}` : `${m.hourMark}h`;
}
