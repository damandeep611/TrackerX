export interface Skill {
  id: string;
  skillName: string;
  category: string;
  targetHours: number;
  currentHours: number;
  skillColor: string;
  slug: string;
  description?: string | null;
  createdAt: string;
}

//why type definations ? - well these types or interfaces let us define the shape of the data.
//  so maintain consistency in frontend and backend as these types are passed to both client and server components

//this skillTodo type is what the todo card will contain
export interface skillTodo {
  id: string;
  skill_id: string; //foreign key linking to the skillCard
  title: string;
  description: string | null;
  done: boolean;
  tags: string[];
  date: string;
  createdAt: string;
  updatedAt: string;
}

// the structure to define the new skilltodo created by form and server action
export type newSkillTodo = {
  title: string;
  description: string | null;
  done: boolean;
  tags: string[];
  skillId: string;
};

// Time log type for tracking individual time entries
export interface TimeLog {
  id: string;
  task_id: string;
  user_id: string;
  skill_id: string;
  minutes: number;
  logged_date: string; // ISO string
  tracked_at: string; // ISO string
}

// New time log creation type
export type NewTimeLog = {
  task_id: string;
  skill_id: string;
  minutes: number;
  logged_date?: string; // Optional, defaults to today
};

// Enhanced skill todo with time logs
export interface skillTodoWithTimeLogs extends skillTodo {
  timeLogs?: TimeLog[];
  totalLoggedTime?: number; // Calculated total from time logs
}