import { getTasks } from "@/actions/taskAction";
import { TodoList } from "@/components/tasks/TodoList";

export default async function Tasks() {
  const data = await getTasks();
  return (
    <div className="">
      <h2>Show breadcrumbs navigation here</h2>
      <div>
        <TodoList initialTodos={data} />
      </div>
    </div>
  );
}
