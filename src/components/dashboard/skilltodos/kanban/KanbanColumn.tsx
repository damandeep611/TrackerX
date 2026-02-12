"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { skillTodo } from "@/types/skillDashboardTypes";
import KanbanTaskCard from "./KanbanTaskCard";
import { Plus, Circle, CircleDashed, CheckCircle2 } from "lucide-react";

interface KanbanColumnProps {
  id: string; // "todo" | "in_progress" | "done"
  title: string;
  tasks: skillTodo[];
  timeData: Record<string, number>;
  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
  onDeleteTodo: (todoId: string) => void;
  onTimeLogCreated: (taskId: string) => void;
  onAddClick?: () => void;
  headerAction?: React.ReactNode;
}

const getColumnIcon = (id: string) => {
  switch (id) {
    case "todo":
      return <Circle size={16} className="text-muted-foreground" />;
    case "in_progress":
      return <CircleDashed size={16} className="text-amber-500" />;
    case "done":
      return <CheckCircle2 size={16} className="text-emerald-500" />;
    default:
      return <Circle size={16} />;
  }
};

const getColumnStyles = (id: string) => {
  switch (id) {
    case "todo":
      return "bg-secondary/20 border-border/40";
    case "in_progress":
      return "bg-amber-500/[0.03] border-amber-500/10";
    case "done":
      return "bg-emerald-500/[0.03] border-emerald-500/10";
    default:
      return "bg-secondary/30 border-border/50";
  }
};

export default function KanbanColumn({
  id,
  title,
  tasks,
  timeData,
  onEditTodo,
  onDeleteTodo,
  onTimeLogCreated,
  onAddClick,
  headerAction,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Column",
    },
  });

  return (
    <div className={`flex flex-col h-full rounded-2xl p-4 border transition-all duration-300 ${getColumnStyles(id)}`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center">
            {getColumnIcon(id)}
          </div>
          <h3 className="font-bold text-sm text-foreground/90 tracking-tight">{title}</h3>
          <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-background border border-border/50 text-[10px] font-bold text-muted-foreground shadow-sm">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {headerAction}
          {id === "todo" && onAddClick && (
            <button
              onClick={onAddClick}
              className="p-1.5 hover:bg-background hover:shadow-sm rounded-md text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border/50"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px] transition-colors rounded-xl ${isOver ? "bg-primary/5 ring-1 ring-primary/20 ring-inset" : ""
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
            />
          ))}
          {tasks.length === 0 && (
            <div className="h-32 border-2 border-dashed border-border/40 rounded-2xl flex flex-col items-center justify-center text-muted-foreground/50 text-xs bg-muted/5 gap-2 group hover:border-primary/20 hover:bg-primary/[0.02] transition-colors">
               <div className="p-2 rounded-full bg-background border border-border/50 shadow-sm group-hover:scale-110 transition-transform">
                  {getColumnIcon(id)}
               </div>
               <span>No tasks in {title}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
