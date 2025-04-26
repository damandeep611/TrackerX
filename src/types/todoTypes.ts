export type todoType = {
  id: string;
  text: string;
  done: boolean;
};

export interface Todo {
  id: string;
  title: string;
  tag: string | null;
  description: string | null;
  date: string;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export type NewTodo = {
  title: string;
  description: string | null;
  tag: string | null;
};