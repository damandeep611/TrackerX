/**
 * Preset accents a user can pick for a skill. These are stored *data* values
 * (skillCard.skill_color is validated as hex), not theme colors, so hex is fine
 * here. They read well on both the light and dark surfaces.
 */
export const SKILL_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Orange", value: "#f97316" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Violet", value: "#8b5cf6" },
] as const;

export const DEFAULT_SKILL_COLOR = SKILL_COLORS[0].value;

/** Translucent tint of a skill color for chips/backgrounds. */
export function tint(color: string, percent = 14): string {
  return `color-mix(in oklab, ${color} ${percent}%, transparent)`;
}
