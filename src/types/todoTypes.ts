//types defined for the shape of the data used in components

export type todoType = {
  id: string;
  text: string;
  done: boolean;
};

//date fields are represented as strings because Date objects are not directly
//serilizable when passing data from server action component to client components
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

// to define the structure of data to create 'new' task to be used by todoForm and add task server action
export type NewTodo = {
  title: string;
  description: string | null;
  tag: string | null;
};
