"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSkillCard, deleteSkillCard, getSkillCard } from "@/actions/skillCardAction";
import { queryKeys } from "@/lib/query-keys";

export type SkillListItem = Awaited<ReturnType<typeof getSkillCard>>[number];

// ---------- Skill list (dashboard) ----------

export function useSkillCards() {
  return useQuery({
    queryKey: queryKeys.skills.list(),
    queryFn: () => getSkillCard(),
  });
}

export function useAddSkillCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addSkillCard,
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.skills.list() }),
  });
}

export function useDeleteSkillCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSkillCard,
    // Optimistically drop the card; roll back if the server refuses.
    onMutate: async (skillId: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.skills.list() });
      const previous = queryClient.getQueryData<SkillListItem[]>(queryKeys.skills.list());
      queryClient.setQueryData<SkillListItem[]>(queryKeys.skills.list(), (old) =>
        old?.filter((s) => s.id !== skillId)
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(queryKeys.skills.list(), ctx.previous);
    },
    onSettled: (_data, _err, skillId) => {
      queryClient.removeQueries({ queryKey: queryKeys.skills.detail(skillId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.skills.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
}
