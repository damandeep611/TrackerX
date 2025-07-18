import { getCurrentHours, getSkillBySlug, getSkillCard } from "@/actions/skillCardAction"

//api functions for react query , need to be moved to app/api when refactoring rest of the server actions and applying-
//  remaining zod validation on forms
export const SkillCardApi  = {
  getAllSkills: async ()=> {
    return await getSkillCard();
  },
  getSkillCurrentHours: async(slug: string)=> {
    return await getCurrentHours(slug);
  },
  getSkillBySlugApi: async (slug: string)=> {
    return await getSkillBySlug(slug)
  }
}