import { getData } from "@/actions/todoAction";
import Todos from "@/components/todo/todos";

export default async function Bookmarks() {
  const data = await getData();
  return (
    <div>
      This is simple todo page
      <Todos todos={data} />
    </div>
  );
}
