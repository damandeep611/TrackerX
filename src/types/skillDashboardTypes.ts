export interface Skill {
  id: string;
  skillName: string;
  category: string;
  targetHours: number;
  currentHours: number;
  skillColor: string;
  slug: string;
}

//why type definations ? - well these types or interfaces let us define the shape of the data.
//  so maintain consistency in frontend and backend as these types are passed to both client and server components 


//this skillTodo type is what the todo card will contain 
export interface skillTodo {
  id: string;
  skill_id: string; //foreign key linking to the skillCard
  title: string;
  description: string | null;
  tags: string[];
  resourceLink: string | null;
  date: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

// the structure to define the new skilltodo created by form and server action
export type newSkillTodo = {
  title: string;
  description: string | null;
  tags: string[];
  skillId: string;
};