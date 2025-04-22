import { getData } from "@/actions/todoAction";
import Todos from "@/components/todo/todos";

export default async function Tasks() {
  const data = await getData();
  return (
    <div className="">
      <h2>Show breadcrumbs navigation here</h2>
      <Todos todos={data} />
    </div>
  );
}
