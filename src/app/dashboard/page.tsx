import { getData } from "@/actions/todoAction";
import { SignOutButton } from "@/components/auth/sign-out";
import Todos from "@/components/todo/todos";

export default async function DashboardPage() {
  const data = await getData();
  return (
    <div>
      <div className="flex items-end justify-end p-8">
        <SignOutButton />
      </div>
      <Todos todos={data} />
    </div>
  );
}
