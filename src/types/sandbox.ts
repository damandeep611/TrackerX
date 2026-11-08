import type { SkillInsights } from "@/lib/insights";

/** Shared shapes passed between the sandbox Server Actions and client components. */

export const RESOURCE_TYPES = ["video", "article", "repo", "documentation"] as const;
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type ResourceStatus = "read" | "unread";

/** A sandbox on the list page, with its logged time and recent activity. */
export interface SandboxSummary {
  id: string;
  name: string;
  targetHours: number;
  createdAt: string; // ISO
  totalMinutes: number;
  /** Minutes logged in the last 7 days (today included). */
  minutes7d: number;
  /** Minutes per day for the last 14 days, oldest → newest. */
  daily14: number[];
  lastLogged: string | null;
}

export interface SandboxMilestone {
  hourMark: number;
  label: string;
}

/** The detail page header: sandbox, trend/streak/pace insights and named milestones. */
export interface SandboxOverview {
  sandbox: { id: string; name: string; targetHours: number; createdAt: string };
  insights: SkillInsights;
  milestones: SandboxMilestone[];
}

export interface SandboxLog {
  id: string;
  title: string | null;
  minutes: number;
  /** The user's local calendar date, "YYYY-MM-DD". */
  date: string;
  createdAt: string; // ISO
}

export interface SandboxResource {
  id: string;
  sandboxId: string;
  title: string;
  url: string;
  thumbnailUrl: string | null;
  resourceType: string;
  status: string;
  createdAt: string; // ISO
}

export type NewSandboxLog = {
  sandboxId: string;
  minutes: number;
  /** The user's local calendar date, "YYYY-MM-DD". */
  date: string;
  title?: string | null;
};

/** Spacing of the auto markers on the dial (owner decision: every 20h). */
export const MILESTONE_STEP_HOURS = 20;
