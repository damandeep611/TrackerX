import {
  buildProjectInsights,
  buildSkillTakeaway,
  lastNDays,
  summarize,
  type DashboardInsights,
  type SkillActivity,
} from "@/lib/insights";
import { buildMarkers } from "@/lib/milestones";
import { SKILL_COLORS } from "@/lib/skill-colors";
import type { SkillListItem } from "@/hooks/useSkills";

/**
 * Sample data for the landing-page previews. Rendered through the real
 * dashboard components (no screenshots), on a fixed date so server and client
 * output match.
 */
const TODAY = new Date("2026-03-12T00:00:00.000Z");
const days = lastNDays(56, TODAY);

// A believable rhythm: mostly-on weekdays, lighter weekends, a couple of gaps.
const minutes = days.map((_, i) => {
  if (i % 9 === 4 || i % 13 === 7) return 0;
  return i % 7 >= 5 ? 25 + ((i * 17) % 40) : 45 + ((i * 29) % 75);
});

const byDay = new Map(days.map((d, i) => [d, minutes[i]]));

export const demoInsights: DashboardInsights = { ...summarize(byDay, TODAY, 56), skills: {} };

const accent = (i: number) => SKILL_COLORS[i % SKILL_COLORS.length].value;

/** Only the fields SkillCard reads are meaningful here. */
export const demoSkill = {
  id: "demo-rust",
  skillName: "Rust",
  slug: "rust",
  category: "Programming",
  targetHours: 100,
  currentHours: 38.5,
  skillColor: accent(0),
} as unknown as SkillListItem;

export const demoSkillActivity: SkillActivity = {
  minutes7d: minutes.slice(-7).reduce((a, b) => a + b, 0),
  daily14: minutes.slice(-14),
  lastLogged: demoInsights.today,
};

export const demoSandbox = {
  name: "Build a toy compiler",
  targetHours: 120,
  totalMinutes: 47.5 * 60,
  markers: buildMarkers(120, 47.5 * 60, [
    { hourMark: 20, label: "Lexer + parser" },
    { hourMark: 40, label: "First program runs" },
    { hourMark: 60, label: "Type checker" },
  ]),
};

/** The real takeaway sentence the skill page would write for this data. */
export const demoTakeaway = buildSkillTakeaway(
  buildProjectInsights(byDay, { minutes: 38.5 * 60, last: demoInsights.today }, TODAY),
  100
);
