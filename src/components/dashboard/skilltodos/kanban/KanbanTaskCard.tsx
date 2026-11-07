"use client";

import React, { useState } from "react";
import { skillTodo } from "@/types/skillDashboardTypes";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Timer, PencilLine, Trash2, CalendarDays, Play } from "lucide-react";
import { formatDuration } from "@/utils/format-time";
import { createTimeLog } from "@/actions/timeLogAction";
import toast from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanTaskCardProps {
  todo: skillTodo;
  timeLogMinutes?: number;
  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
  onDeleteTodo: (todoId: string) => void;
  onTimeLogCreated?: () => void;
  isOverlay?: boolean;
}

export default function KanbanTaskCard({
  todo,
  timeLogMinutes = 0,
  onEditTodo,
  onDeleteTodo,
  onTimeLogCreated,
  isOverlay = false,
}: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: {
      type: "Task",
      task: todo,
    },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const [optimisticMinutes, setOptimisticMinutes] = useState<number | null>(null);
  const displayMinutes = optimisticMinutes !== null ? optimisticMinutes : timeLogMinutes;

  const handleTimeUpdate = async () => {
    try {
      const minutesToAdd = 30;
      const newTotal = displayMinutes + minutesToAdd;
      setOptimisticMinutes(newTotal);

      const result = await createTimeLog({
        task_id: todo.id,
        skill_id: todo.skill_id,
        minutes: minutesToAdd,
        logged_date: new Date().toISOString().split("T")[0],
      });

      if (result.success) {
        toast.success(`Added 30m to task`);
        onTimeLogCreated?.();
      } else {
        setOptimisticMinutes(null);
        toast.error("Failed to update time.");
      }
    } catch {
      setOptimisticMinutes(null);
      toast.error("Failed to update time.");
    }
  };
  
  const handleDelete = () => {
    onDeleteTodo(todo.id);
  };

  const isDone = todo.status === 'done' || todo.done;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex flex-col gap-4 rounded-2xl bg-card border p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-grab active:cursor-grabbing mb-4 ${
        isDone 
          ? "border-emerald-500/40 bg-emerald-500/[0.02] shadow-emerald-500/5" 
          : "border-border hover:border-primary/20"
      } ${
        isOverlay ? "rotate-2 shadow-2xl scale-105 cursor-grabbing z-50 ring-2 ring-primary/20" : ""
      }`}
    >
      {/* Top Section: Category & Actions */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
           <h4 className="font-bold text-sm text-foreground leading-tight line-clamp-2 mt-1">
             {todo.title}
           </h4>
        </div>

        <div 
          className="relative" 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground transition-colors border border-transparent hover:border-border">
                <MoreHorizontal size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onEditTodo(todo.id, {})}>
                <PencilLine className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
               <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => handleDelete()}
               >
                 <Trash2 className="mr-2 h-4 w-4" /> Delete
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Date, Time and Tags Row */}
      <div className="flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground font-medium">
         <div className="flex items-center gap-1 bg-secondary/50 px-1.5 py-0.5 rounded-md border border-border/50">
            <CalendarDays size={10} className="text-primary/70" />
            <span suppressHydrationWarning>{new Date(todo.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
         </div>
         
         <div className="flex items-center gap-0 bg-primary/5 rounded-md border border-primary/10 overflow-hidden">
            <div className="flex items-center gap-1 px-1.5 py-0.5">
               <Timer size={10} className="text-primary" />
               <span className="font-mono text-primary">{formatDuration(displayMinutes)}</span>
            </div>
            {!isDone && (
               <button 
                  onClick={handleTimeUpdate}
                  className="bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-1.5 py-0.5 transition-all duration-300 border-l border-primary/10"
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Add 30 mins"
               >
                  <Play size={8} className="fill-current" />
               </button>
            )}
         </div>
         
         <div className="flex items-center gap-1 ml-auto">
            {todo.tags?.slice(0, 2).map((tag, i) => (
               <div key={i} className="px-1.5 py-0.5 rounded-full bg-background border border-border shadow-sm text-muted-foreground">
                  {tag}
               </div>
            ))}
            {todo.tags && todo.tags.length > 2 && (
               <div className="px-1.5 py-0.5 rounded-full bg-background border border-border shadow-sm text-muted-foreground">
                  +{todo.tags.length - 2}
               </div>
            )}
         </div>
      </div>

      {/* Description if exists */}
      {todo.description && (
        <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed bg-muted/30 p-2 rounded-lg border border-border/30">
          {todo.description}
        </p>
      )}
    </div>
  );
}
