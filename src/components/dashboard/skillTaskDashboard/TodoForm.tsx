"use client";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

interface TodoFormData {
  title: string;
  description: string;
}

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => void;
}
export default function TodoForm({ onSubmit }: TodoFormProps) {
  const { register, handleSubmit, reset } = useForm<TodoFormData>();

  // submit action on the form
  const onFormSubmit = (data: TodoFormData) => {
    onSubmit(data);
    reset();
  };
  return (
    <div className="w-full rounded-lg shadow-sm p-4">
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div>
          <input
            {...register("title", { required: true })}
            placeholder="Enter the Task here"
            className="border border-gray-200 p-2 w-full focus:outline-none focus:ring-1 focus:ring-blue-200 rounded-md"
          />
        </div>
        <div>
        <div>
          <textarea
            {...register("description")}
            placeholder="for description(optional)"
            className="w-full p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 border border-gray-300"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button">Esc</Button>
          <Button type="submit">Add</Button>
        </div>
        </div>
      </form>
    </div>
  );
}
