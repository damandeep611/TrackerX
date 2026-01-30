"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { skillTodo } from "@/types/skillDashboardTypes";
import KanbanTaskCard from "./KanbanTaskCard";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  id: string; // "todo" | "in_progress" | "done"
  title: string;
  tasks: skillTodo[];
  timeData: Record<string, number>;
  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
  onDeleteTodo: (todoId: string) => void;
  onTimeLogCreated: (taskId: string) => void;
  onToggleDone: (todoId: string, isDone: boolean) => void;
  onAddClick?: () => void;
}

export default function KanbanColumn({
  id,
  title,
  tasks,
  timeData,
  onEditTodo,
  onDeleteTodo,
  onTimeLogCreated,
  onToggleDone,
  onAddClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
    },
  });

  // Limit to showing recent 5 initially? 
  // The prompt said "show recent 5", but also "make scrollable".
  // If we only show 5, the scroll isn't useful unless we fetch more.
  // For now, let's render all but in a scrollable container.
  // We can interpret "show recent 5" as "the viewport height allows seeing ~5 cards".

  return (
    <div className="flex flex-col h-full bg-secondary/30 rounded-2xl p-4 border border-border/50">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <span className="flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
            {tasks.length}
          </span>
        </div>

        {id === "todo" && onAddClick && (
          <button
            onClick={onAddClick}
            className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Scrollable Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[150px] transition-colors rounded-xl ${isOver ? "bg-primary/5 ring-2 ring-primary/20 ring-inset" : ""
          }`}
      >
        <div className="flex flex-col gap-0 pb-4">
          {tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              todo={task}
              timeLogMinutes={timeData[task.id] || 0}
              onEditTodo={onEditTodo}
              onDeleteTodo={onDeleteTodo}
              onTimeLogCreated={() => onTimeLogCreated(task.id)}
              onToggleDone={onToggleDone}
            />
          ))}
          {tasks.length === 0 && (
            <div className="h-24 border-2 border-dashed border-border rounded-xl flex items-center justify-center text-muted-foreground text-xs bg-muted/20">
              Drop items here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
