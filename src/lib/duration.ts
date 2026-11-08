/**
 * Client-side helpers for the "log time" flow. Durations are whole minutes.
 */

/**
 * Parses "45", "45m", "1h", "1.5h", "1h30", "1h 30m", "1:30" into minutes.
 * Returns null for anything else (or zero).
 */
export function parseDuration(input: string): number | null {
  const s = input.trim().toLowerCase().replace(/\s+/g, "");
  if (!s) return null;
  let m: RegExpMatchArray | null;
  let minutes: number;
  if ((m = s.match(/^(\d+):([0-5]\d)$/))) minutes = Number(m[1]) * 60 + Number(m[2]);
  else if ((m = s.match(/^(\d+(?:\.\d+)?)h(?:(\d+)m?)?$/))) minutes = Number(m[1]) * 60 + Number(m[2] ?? 0);
  else if ((m = s.match(/^(\d+)(?:m|min|mins)?$/))) minutes = Number(m[1]);
  else return null;
  minutes = Math.round(minutes);
  return minutes > 0 ? minutes : null;
}

/** "1h 30m", "45m", "2h". */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/** The browser's local calendar date, "YYYY-MM-DD". */
export function localDateKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
