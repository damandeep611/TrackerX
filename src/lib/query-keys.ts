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
  sandboxes: {
    all: ["sandboxes"] as const,
    list: () => [...queryKeys.sandboxes.all, "list"] as const,
    detail: (id: string) => [...queryKeys.sandboxes.all, "detail", id] as const,
    overview: (id: string) => [...queryKeys.sandboxes.detail(id), "overview"] as const,
    logs: (id: string) => [...queryKeys.sandboxes.detail(id), "logs"] as const,
    resources: (id: string) => [...queryKeys.sandboxes.detail(id), "resources"] as const,
  },
};
