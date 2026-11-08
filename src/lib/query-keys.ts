/**
 * Single source of truth for React Query keys.
 * Keys are hierarchical so a prefix invalidates everything under it, e.g.
 * `queryKeys.skills.detail(id)` invalidates that skill's tasks, insights and
 * tag suggestions in one call.
 */
export const queryKeys = {
  skills: {
    all: ["skills"] as const,
    list: () => [...queryKeys.skills.all, "list"] as const,
    detail: (skillId: string) => [...queryKeys.skills.all, "detail", skillId] as const,
    tasks: (skillId: string) => [...queryKeys.skills.detail(skillId), "tasks"] as const,
    insights: (skillId: string) => [...queryKeys.skills.detail(skillId), "insights"] as const,
    tagSuggestions: (skillId: string) => [...queryKeys.skills.detail(skillId), "tagSuggestions"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    insights: () => [...queryKeys.dashboard.all, "insights"] as const,
    weeklyProgress: () => [...queryKeys.dashboard.all, "weeklyProgress"] as const,
  },
  goals: {
    all: ["goals"] as const,
    list: () => [...queryKeys.goals.all, "list"] as const,
    detail: (slug: string) => [...queryKeys.goals.all, "detail", slug] as const,
    logs: (goalId: string) => [...queryKeys.goals.all, "logs", goalId] as const,
  },
};
