"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CornerDownLeft, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddTask, useTagSuggestions } from "@/hooks/useSkillPage";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/skillDashboardTypes";
import { TagPicker } from "./TagPicker";

/**
 * Inline quick-add: type a title + Enter. Details (notes, tags, start as
 * "Doing") are optional and stay open between adds. Press N anywhere to focus.
 */
export function QuickAddTask({ skillId }: { skillId: string }) {
  const addTask = useAddTask(skillId);
  const { data: tagSuggestions } = useTagSuggestions(skillId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState<Extract<TaskStatus, "todo" | "in_progress">>("todo");

  // "N" focuses the input (outside text fields).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.key.toLowerCase() !== "n" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (el.closest("input, textarea, select, [contenteditable=true], [role=dialog], [role=menu]")) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = title.trim();
    if (!t) return;
    addTask.mutate(
      { title: t, description: description.trim() || null, tags, status },
      { onError: (err) => toast.error(err.message || "Couldn't add the task") }
    );
    setTitle("");
    setDescription("");
    setTags([]);
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-border bg-card shadow-panel transition-colors focus-within:border-border-strong"
    >
      <div className="flex items-center gap-2 px-3">
        <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          aria-label="New task title"
          maxLength={255}
          className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground"
        />
        {title.trim() ? (
          <Button type="submit" size="xs" variant="secondary">
            Add <CornerDownLeft className="size-3" />
          </Button>
        ) : (
          <kbd className="hidden rounded border border-border bg-surface-2 px-1.5 text-[11px] text-subtle-foreground sm:inline">
            N
          </kbd>
        )}
        <Button
          type="button"
          size="xs"
          variant="ghost"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="quick-add-details"
        >
          Details
          <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
        </Button>
      </div>

      {open && (
        <div id="quick-add-details" className="grid gap-3 border-t border-border px-3 py-3">
          <Textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Notes (optional)"
            maxLength={700}
            aria-label="Task notes"
          />
          <TagPicker
            value={tags}
            onChange={setTags}
            recent={tagSuggestions?.recent}
            suggested={tagSuggestions?.suggested}
          />
          <div className="flex items-center justify-between gap-2">
            <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <TabsList className="h-8">
                <TabsTrigger value="todo" className="text-xs">To do</TabsTrigger>
                <TabsTrigger value="in_progress" className="text-xs">Start now</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button type="submit" size="sm" variant="brand" disabled={!title.trim()}>
              Add task
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
