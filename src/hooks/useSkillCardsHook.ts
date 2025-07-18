import { addSkillCard, deleteSkillCard } from "@/actions/skillCardAction"
import { SkillCardApi } from "@/lib/api/skillCardApi"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


//query key management 
export const skillCardKeys = {
  all: ['skillCards'] as const,
  lists: ()=> [...skillCardKeys.all, 'list'] as const,
  list: (filters: string)=> [...skillCardKeys.lists(), filters] as const,
  details: ()=> [...skillCardKeys.all, 'details'] as const,
  detail: (slug: string)=> [...skillCardKeys.details(), slug] as const,
  hours: (slug: string) => [...skillCardKeys.all, 'hours', slug] as const,
}

//hook to get all skill cards 
export const useSkillCards = ()=> {
  return useQuery({
    queryKey: skillCardKeys.lists(),
    queryFn: SkillCardApi.getAllSkills,
    staleTime: 10 * 60 * 1000,
  })
}

//hook to get current hours for a skill
export const useCurrentHours = (slug: string)=> {
  return useQuery({
    queryKey: skillCardKeys.hours(slug),
    queryFn: ()=> SkillCardApi.getSkillCurrentHours(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  })
}

//hook to get skill by slug
export const useSkillBySlug = (slug: string) => {
  return useQuery({
    queryKey: skillCardKeys.detail(slug),
    queryFn: ()=> SkillCardApi.getSkillBySlugApi(slug),
    enabled: !!slug,
  })
}

//mutation for adding skill card 
export const useAddSkillCard = ()=> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSkillCard,
    onSuccess: ()=> {
      //invalidate and refetch skill cards 
      queryClient.invalidateQueries({queryKey: skillCardKeys.lists()})
    }
  })
}

//mutation for deleting skill card 
export const useDeleteSkillCard = ()=> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSkillCard,
    onSuccess: (_, deletedId)=> {
      queryClient.invalidateQueries({queryKey: skillCardKeys.lists()});
      queryClient.removeQueries({queryKey: skillCardKeys.detail(deletedId)})
    }
  })
}