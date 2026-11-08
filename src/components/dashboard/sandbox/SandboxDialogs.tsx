"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateSandbox, useDeleteSandbox } from "@/hooks/useSandbox";

const TARGET_PRESETS = [40, 80, 120, 200];

/** New sandbox: a name and a target in hours (markers every 20h follow from it). */
export function CreateSandboxDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const create = useCreateSandbox();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("80");

  const hours = Number(target);
  const valid = name.trim() !== "" && Number.isInteger(hours) && hours >= 1 && hours <= 100_000;

  const close = (next: boolean) => {
    if (create.isPending) return;
    onOpenChange(next);
    if (!next) {
      setName("");
      setTarget("80");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      const sandbox = await create.mutateAsync({ name: name.trim(), targetHours: hours });
      onOpenChange(false);
      setName("");
      setTarget("80");
      router.push(`/dashboard/sandbox/${sandbox.id}`);
    } catch (err) {
      toast.error(err instanceof Error && err.message ? err.message : "Couldn't create the sandbox");
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New sandbox</DialogTitle>
          <DialogDescription>
            A deep-work project with an hour target. You&apos;ll get a milestone every 20 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="sandbox-name">Name</Label>
            <Input
              id="sandbox-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Build a compiler, Learn Blender"
              maxLength={120}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sandbox-target">Target hours</Label>
            <div className="flex flex-wrap items-center gap-1.5">
              <Input
                id="sandbox-target"
                type="number"
                inputMode="numeric"
                min={1}
                max={100000}
                step={1}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="tabular w-24"
                required
              />
              {TARGET_PRESETS.map((h) => (
                <Chip key={h} active={hours === h} onClick={() => setTarget(String(h))}>
                  {h}h
                </Chip>
              ))}
            </div>
            <p className="text-xs text-subtle-foreground">
              {Number.isInteger(hours) && hours >= 20
                ? `${Math.floor(hours / 20)} milestone${hours >= 40 ? "s" : ""} along the way.`
                : "Targets under 20h have no milestones."}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)} disabled={create.isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={!valid || create.isPending}>
              {create.isPending && <Loader2 className="animate-spin" />}
              Create sandbox
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Confirm before deleting: sessions, milestones and resources go with it. */
export function DeleteSandboxDialog({
  sandbox,
  open,
  onOpenChange,
  redirectTo,
}: {
  sandbox: { id: string; name: string };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where to go after deleting (from the detail page). */
  redirectTo?: string;
}) {
  const router = useRouter();
  const del = useDeleteSandbox();

  const onDelete = async () => {
    try {
      await del.mutateAsync(sandbox.id);
      toast.success(`${sandbox.name} deleted`);
      onOpenChange(false);
      if (redirectTo) router.push(redirectTo);
    } catch {
      toast.error("Couldn't delete the sandbox. Please try again.");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !del.isPending && onOpenChange(o)}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete {sandbox.name}?</DialogTitle>
          <DialogDescription>
            All of its sessions, milestone names and resources are removed for good. This can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={del.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={del.isPending}>
            Delete sandbox
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
