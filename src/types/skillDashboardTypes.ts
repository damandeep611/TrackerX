export interface Skill {
  id: string;
  skillName: string;
  category: string;
  targetHours: number;
  currentHours: number;
  skillColor: string;
  slug: string;
}


export interface SkillTodo {
  id: string;
  title: string;
  description?: string;
  relatedSkill: string;
}