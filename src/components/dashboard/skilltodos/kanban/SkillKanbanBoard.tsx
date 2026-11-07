"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useTaskTimeTotals } from "@/hooks/useSkills";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  CollisionDetection,
  getFirstCollision,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { newSkillTodo, skillTodo } from "@/types/skillDashboardTypes";
import { useSkillTodoManager } from "@/hooks/useSkillTodoManager";
import KanbanColumn from "./KanbanColumn";
import KanbanTaskCard from "./KanbanTaskCard";
import SkillTodoForm from "../skill-todo-form";
import Modal from "@/components/ui/modal";
import { createPortal } from "react-dom";
import { startOfDay, isSameDay, isBefore } from "date-fns";
import { Plus, History, Calendar } from "lucide-react";

interface SkillKanbanBoardProps {
  initialSkillTodos: skillTodo[];
  skillId: string;
  view?: "grid" | "kanban";
  selectedDate?: Date;
}

const COLUMNS = [
  { id: "todo", title: "Todo list" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export default function SkillKanbanBoard({
  initialSkillTodos,
  skillId,
  view = "kanban",
  selectedDate = new Date(),
}: SkillKanbanBoardProps) {
  const {
    skillTodos,
    isAddingTodo,
    setIsAddingTodo,
    handleAddTodo,
    handleEditTodo,
    handleDeleteTodo,
    handleUpdateStatus,
    isSubmittingForm,
    setSkillTodos,
  } = useSkillTodoManager({
    initialSkillTodos,
    skillId,
    selectedDate,
  });

  // Minutes logged per task; refreshed automatically when time is logged.
  const { data: timeData = {} } = useTaskTimeTotals(
    skillId,
    useMemo(() => skillTodos.map((t) => t.id), [skillTodos])
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);

  // State for editing via Modal
  const [editingTodo, setEditingTodo] = useState<skillTodo | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection that prioritizes sortable items (tasks) but falls back to columns
  const collisionDetectionStrategy: CollisionDetection = React.useCallback((args) => {
    // First, check if we're directly over a sortable task
    const pointerCollisions = pointerWithin(args);
    const pointerCollision = getFirstCollision(pointerCollisions, 'id');

    if (pointerCollision) {
      // Check if this is a task
      const isTask = args.droppableContainers.find(
        (container) => container.id === pointerCollision && container.data.current?.type === 'Task'
      );
      if (isTask) {
        return pointerCollisions;
      }
    }

    // Check for column collisions using rectIntersection (more forgiving)
    const rectCollisions = rectIntersection(args);

    // Filter to get only column collisions
    const columnCollisions = rectCollisions.filter((collision) => {
      return COLUMNS.some((col) => col.id === collision.id);
    });

    // If we found a column, return it
    if (columnCollisions.length > 0) {
      return columnCollisions;
    }

    // Fall back to any pointer collisions or rect collisions
    return pointerCollisions.length > 0 ? pointerCollisions : rectCollisions;
  }, []);

  const columns = useMemo(() => {
    const cols: Record<string, skillTodo[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };

    if (view === "grid") {
      skillTodos.forEach((todo) => {
        let status = todo.status || (todo.done ? "done" : "todo");
        if (!cols[status]) status = "todo";
        cols[status].push(todo);
      });
      return cols;
    }

    const targetDate = startOfDay(selectedDate);
    const today = startOfDay(new Date());

    skillTodos.forEach((todo) => {
      let status = todo.status || (todo.done ? "done" : "todo");
      if (!cols[status]) status = "todo";
      
      const todoDate = startOfDay(new Date(todo.date));
      const isForSelectedDate = isSameDay(todoDate, targetDate);
      const isOverdue = isBefore(todoDate, today) && status !== "done";

      if (status === "todo") {
        if (showOverdue) {
          if (isForSelectedDate || isOverdue) {
            cols[status].push(todo);
          }
        } else {
          if (isForSelectedDate) {
            cols[status].push(todo);
          }
        }
      } else {
        // For in_progress and done, we only show items for the selected date
        if (isForSelectedDate) {
          cols[status].push(todo);
        }
      }
    });

    return cols;
  }, [skillTodos, selectedDate, showOverdue, view]);

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";

    if (!isActiveTask) return;

    // Find indices in the source array
    const activeIndex = skillTodos.findIndex((t) => t.id === activeId);

    // 1. Over another Task?
    if (isOverTask) {
      const overIndex = skillTodos.findIndex((t) => t.id === overId);
      if (activeIndex === -1 || overIndex === -1) return;

      const activeTask = skillTodos[activeIndex];
      const overTask = skillTodos[overIndex];

      const activeStatus = activeTask.status || (activeTask.done ? "done" : "todo");
      const overStatus = overTask.status || (overTask.done ? "done" : "todo");

      if (activeStatus !== overStatus || activeIndex !== overIndex) {
        setSkillTodos((prev) => {
          // Use arrayMove to handle reordering visually
          const newTodos = arrayMove(prev, activeIndex, overIndex);

          // Ensure the status is updated to match the target
          if (activeStatus !== overStatus) {
            const updatedActive = newTodos.find(t => t.id === activeId);
            if (updatedActive) {
              updatedActive.status = overStatus;
              updatedActive.done = overStatus === "done";
            }
          }
          return newTodos;
        });
      }
    }
    // 2. Over a Column?
    else if (COLUMNS.some((c) => c.id === overId)) {
      const activeTask = skillTodos[activeIndex];
      if (!activeTask) return;

      const overColumnId = overId;
      const activeStatus = activeTask.status || (activeTask.done ? "done" : "todo");

      if (activeStatus !== overColumnId) {
        setSkillTodos((prev) =>
          prev.map((t) =>
            t.id === activeId
              ? { ...t, status: overColumnId, done: overColumnId === "done" }
              : t
          )
        );
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const activeTask = skillTodos.find((t) => t.id === activeId);

    // The state might have been updated by onDragOver already.
    // We just need to persist the final status.
    if (activeTask) {
      handleUpdateStatus(activeId, activeTask.status);
    }
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  const activeTask = activeId ? skillTodos.find((t) => t.id === activeId) : null; 

  // Handle opening the edit modal
  const openEditModal = (todoId: string) => {
    const todo = skillTodos.find(t => t.id === todoId);
    if (todo) {
      setEditingTodo(todo);
    }
  };

  // Handle submitting the edit form
  const handleEditSubmit = (updatedData: Omit<newSkillTodo, "skillId">) => {
    if (!editingTodo) return;

    handleEditTodo(editingTodo.id, {
      title: updatedData.title,
      description: updatedData.description,
      tags: updatedData.tags,
      // Status/Done updates are handled by Kanban moves, not this form generally, 
      // but we can support them if needed. For now sticking to content updates.
    });
    setEditingTodo(null);
  };

  // Prevent SSR hydration mismatch by not rendering DndContext on server
  if (!mounted) {
    return (
      <div className="h-full w-full p-4 overflow-x-auto">
        <div className="flex flex-col md:flex-row h-full gap-6 min-w-[800px]">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex-1 min-w-[280px]">
              <div className="flex flex-col h-full bg-secondary/30 rounded-2xl p-4 border border-border/50 animate-pulse">
                <div className="h-6 w-24 bg-muted rounded mb-4"></div>
                <div className="flex-1 bg-muted/10 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full p-4 overflow-x-auto">
      {view === "kanban" ? (
        <div className="flex flex-col md:flex-row h-full gap-6 min-w-[800px]">
          <DndContext
            id="skill-kanban-board"
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={skillTodos.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {COLUMNS.map((col) => (
                <div key={col.id} className="flex-1 min-w-[280px]">
                  <KanbanColumn
                    id={col.id}
                    title={col.title}
                    tasks={columns[col.id]}
                    timeData={timeData}
                    onEditTodo={openEditModal}
                    onDeleteTodo={handleDeleteTodo}
                    onAddClick={() => setIsAddingTodo(true)}
                    headerAction={
                      col.id === "todo" ? (
                        <button
                          onClick={() => setShowOverdue(!showOverdue)}
                          className={`p-1.5 rounded-md transition-all border flex items-center gap-1.5 ${
                            showOverdue 
                            ? "bg-primary/10 text-primary border-primary/20 shadow-sm" 
                            : "text-muted-foreground hover:text-foreground border-transparent hover:border-border/50 hover:bg-background"
                          }`}
                          title={showOverdue ? "Showing Overdue + Selected Date" : "Showing Selected Date Only"}
                        >
                          <History size={14} className={showOverdue ? "animate-pulse" : ""} />
                          {showOverdue && <span className="text-[10px] font-bold uppercase tracking-tight">Overdue</span>}
                        </button>
                      ) : undefined
                    }
                  />
                </div>
              ))}
            </SortableContext>

            {createPortal(
              <DragOverlay dropAnimation={dropAnimation}>
                {activeTask ? (
                  <KanbanTaskCard
                    todo={activeTask}
                    timeLogMinutes={timeData[activeTask.id] || 0}
                    onEditTodo={() => { }}
                    onDeleteTodo={() => { }}
                    isOverlay
                  />
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                   <Calendar size={14} className="text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                   Grid View: {columns.todo.length + columns.in_progress.length + columns.done.length} Total Tasks
                </span>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...columns.todo, ...columns.in_progress, ...columns.done].map((todo) => (
            <KanbanTaskCard
              key={todo.id}
              todo={todo}
              timeLogMinutes={timeData[todo.id] || 0}
              onEditTodo={openEditModal}
              onDeleteTodo={handleDeleteTodo}
            />
          ))}
          <button 
            onClick={() => setIsAddingTodo(true)}
            className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group min-h-[160px]"
          >
            <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
              <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground group-hover:text-primary">Add Task</span>
          </button>
        </div>
      </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isAddingTodo}
        onClose={() => setIsAddingTodo(false)}
        title="Create New Task"
      >
        <SkillTodoForm
          onAddSkillTodo={handleAddTodo}
          onCancel={() => setIsAddingTodo(false)}
          isSubmitting={isSubmittingForm}
          skillId={skillId}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        title="Edit Task"
      >
        {editingTodo && (
          <SkillTodoForm
            onAddSkillTodo={handleEditSubmit} // Reuse the submit handler logic
            onCancel={() => setEditingTodo(null)}
            isSubmitting={isSubmittingForm}
            skillId={skillId}
            initialValues={{
              title: editingTodo.title,
              description: editingTodo.description,
              tags: editingTodo.tags,
              done: editingTodo.done,
              status: editingTodo.status,
            }}
          />
        )}
      </Modal>
    </div>
  );
}