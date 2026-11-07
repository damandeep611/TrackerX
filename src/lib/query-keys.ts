/**
 * Single source of truth for React Query keys.
 * Keys are hierarchical so a prefix invalidates everything under it, e.g.
 * `queryKeys.skills.detail(id)` invalidates that skill's hours, analytics,
 * tag stats, timeline and task totals in one call.
 */
export const queryKeys = {
  skills: {
    all: ["skills"] as const,
    list: () => [...queryKeys.skills.all, "list"] as const,
    detail: (skillId: string) => [...queryKeys.skills.all, "detail", skillId] as const,
    hours: (skillId: string) => [...queryKeys.skills.detail(skillId), "hours"] as const,
    analytics: (skillId: string) => [...queryKeys.skills.detail(skillId), "analytics"] as const,
    tagStats: (skillId: string) => [...queryKeys.skills.detail(skillId), "tagStats"] as const,
    recentTags: (skillId: string) => [...queryKeys.skills.detail(skillId), "recentTags"] as const,
    timeByDate: (skillId: string) => [...queryKeys.skills.detail(skillId), "timeByDate"] as const,
    taskTotals: (skillId: string, taskIds: string[]) =>
      [...queryKeys.skills.detail(skillId), "taskTotals", taskIds] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    overview: () => [...queryKeys.dashboard.all, "overview"] as const,
    weeklyProgress: () => [...queryKeys.dashboard.all, "weeklyProgress"] as const,
    weeklyRhythm: () => [...queryKeys.dashboard.all, "weeklyRhythm"] as const,
  },
  goals: {
    all: ["goals"] as const,
    list: () => [...queryKeys.goals.all, "list"] as const,
    detail: (slug: string) => [...queryKeys.goals.all, "detail", slug] as const,
    logs: (goalId: string) => [...queryKeys.goals.all, "logs", goalId] as const,
  },
};
