"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDuration } from "@/lib/duration";
import type { SkillTask, SkillTaskPatch, TaskStatus } from "@/types/skillDashboardTypes";
import { STATUS_META } from "./TaskRow";
import { TagPicker } from "./TagPicker";

/** Edit title, notes, tags and status. Mount with `key={task.id}` to reset per task. */
export function TaskEditDialog({
  task,
  onClose,
  onSave,
  recentTags,
  suggestedTags,
}: {
  task: SkillTask;
  onClose: () => void;
  onSave: (patch: SkillTaskPatch) => void;
  recentTags?: string[];
  suggestedTags?: string[];
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [tags, setTags] = useState(task.tags);
  const [status, setStatus] = useState<TaskStatus>(task.status);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim() || null, tags, status });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit task</DialogTitle>
          <DialogDescription>
            Created{" "}
            {new Date(task.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            {task.minutes > 0 && ` · ${formatDuration(task.minutes)} logged`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              required
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-notes">
              Notes <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="task-notes"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={700}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-tags">Tags</Label>
            <TagPicker
              id="task-tags"
              value={tags}
              onChange={setTags}
              recent={recentTags}
              suggested={suggestedTags}
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Tabs value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <TabsList>
                {(Object.keys(STATUS_META) as TaskStatus[]).map((s) => (
                  <TabsTrigger key={s} value={s}>
                    {STATUS_META[s].label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={!title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
