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
import { Checkbox } from "@/components/ui/checkbox";

interface KanbanTaskCardProps {
  todo: skillTodo;
  timeLogMinutes?: number;
  onEditTodo: (todoId: string, updatedTodo: Partial<skillTodo>) => void;
  onDeleteTodo: (todoId: string) => void;
  onTimeLogCreated?: () => void;
  onToggleDone: (todoId: string, isDone: boolean) => void;
  isOverlay?: boolean;
}

export default function KanbanTaskCard({
  todo,
  timeLogMinutes = 0,
  onEditTodo,
  onDeleteTodo,
  onTimeLogCreated,
  onToggleDone,
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
    } catch (error) {
      setOptimisticMinutes(null);
      toast.error("Failed to update time.");
    }
  };
  
  const handleDelete = () => {
    onDeleteTodo(todo.id);
    toast.success("Task deleted");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex flex-col gap-3 rounded-2xl bg-card border border-border p-4 shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-200 cursor-grab active:cursor-grabbing mb-3 ${
        isOverlay ? "rotate-2 shadow-xl scale-105 cursor-grabbing z-50 ring-2 ring-primary/20" : ""
      }`}
    >
      {/* Header: Tags & Actions */}
      <div className="flex items-start justify-between gap-2">
        <div 
          className="pt-0.5"
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox 
            checked={todo.status === 'done' || todo.done}
            onCheckedChange={(checked) => onToggleDone(todo.id, checked as boolean)}
            className="h-4 w-4 rounded-[4px] border-muted-foreground/40 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 mr-auto">
          {todo.tags?.slice(0, 3).map((tag, i) => (
             <span
              key={i}
              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-secondary text-secondary-foreground border border-black/5 dark:border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div 
          className="relative" 
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 hover:bg-muted rounded-md text-muted-foreground transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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

      {/* Content */}
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-sm text-card-foreground leading-tight line-clamp-2">
          {todo.title}
        </h4>
        {todo.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {todo.description}
          </p>
        )}
      </div>

      {/* Footer: Date & Time */}
      <div className="flex items-center justify-between pt-2 mt-auto border-t border-border/50">
         <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1">
               <CalendarDays size={12} />
               <span suppressHydrationWarning>{new Date(todo.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
         </div>

         <div className="flex items-center gap-2" onPointerDown={(e) => e.stopPropagation()}>
             <div className="flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-md">
                <Timer size={12} className="text-primary" />
                <span className="text-[10px] font-medium font-mono">{formatDuration(displayMinutes)}</span>
             </div>
             
             {todo.status !== 'done' && (
               <button 
                  onClick={handleTimeUpdate}
                  className="p-1.5 hover:bg-primary hover:text-primary-foreground rounded-md text-muted-foreground transition-colors flex items-center justify-center border border-transparent hover:border-border"
                  title="Add 30 mins"
               >
                  <Play size={10} className="fill-current" />
               </button>
             )}
         </div>
      </div>
    </div>
  );
}
