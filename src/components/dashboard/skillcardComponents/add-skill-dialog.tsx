"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
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
import { Chip } from "@/components/ui/chip";
import { Label } from "@/components/ui/label";
import { useAddSkillCard } from "@/hooks/useSkills";
import { cn } from "@/lib/utils";
import { DEFAULT_SKILL_COLOR, SKILL_COLORS } from "@/lib/skill-colors";

const TARGET_PRESETS = [20, 50, 100, 500];

const EMPTY = {
  skillName: "",
  category: "",
  targetHours: "50",
  skillColor: DEFAULT_SKILL_COLOR as string,
  description: "",
};

export function AddSkillDialog({
  open,
  onOpenChange,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Existing categories, offered as one-click chips. */
  categories: string[];
}) {
  const [form, setForm] = useState(EMPTY);
  const addSkill = useAddSkillCard();
  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const target = Number(form.targetHours);
  const valid =
    form.skillName.trim() !== "" &&
    form.category.trim() !== "" &&
    Number.isFinite(target) &&
    target >= 1;

  const close = (next: boolean) => {
    if (addSkill.isPending) return;
    onOpenChange(next);
    if (!next) setForm(EMPTY);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    try {
      await addSkill.mutateAsync({
        skillName: form.skillName.trim(),
        category: form.category.trim(),
        targetHours: Math.floor(target),
        skillColor: form.skillColor,
        description: form.description.trim() || undefined,
      });
      toast.success(`${form.skillName.trim()} added`);
      onOpenChange(false);
      setForm(EMPTY);
    } catch {
      toast.error("Couldn't add the skill. Please try again.");
    }
  };

  const shownCategories = categories.slice(0, 6);

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New skill</DialogTitle>
          <DialogDescription>Pick something to get better at and set a target.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="skill-name">Name</Label>
            <Input
              id="skill-name"
              autoFocus
              value={form.skillName}
              onChange={(e) => set("skillName", e.target.value)}
              placeholder="e.g. Rust, Spanish, Guitar"
              maxLength={100}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="skill-category">Category</Label>
            <Input
              id="skill-category"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Programming"
              maxLength={60}
              required
            />
            {shownCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {shownCategories.map((c) => (
                  <Chip key={c} active={form.category === c} onClick={() => set("category", c)}>
                    {c}
                  </Chip>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="skill-target">Target hours</Label>
            <div className="flex flex-wrap items-center gap-1.5">
              <Input
                id="skill-target"
                type="number"
                inputMode="numeric"
                min={1}
                max={100000}
                value={form.targetHours}
                onChange={(e) => set("targetHours", e.target.value)}
                className="tabular w-24"
                required
              />
              {TARGET_PRESETS.map((h) => (
                <Chip key={h} active={target === h} onClick={() => set("targetHours", String(h))}>
                  {h}h
                </Chip>
              ))}
            </div>
          </div>

          <fieldset className="grid gap-2">
            <legend className="mb-2 text-sm font-medium">Color</legend>
            <div className="flex flex-wrap gap-2">
              {SKILL_COLORS.map((c) => {
                const selected = form.skillColor === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    aria-label={c.name}
                    aria-pressed={selected}
                    onClick={() => set("skillColor", c.value)}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full ring-offset-2 ring-offset-popover transition-shadow outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                      selected && "ring-2 ring-foreground/60"
                    )}
                    style={{ background: c.value }}
                  >
                    {selected && <Check className="size-3.5 text-white" aria-hidden />}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-2">
            <Label htmlFor="skill-description">
              Notes <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="skill-description"
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Why it matters, what done looks like…"
              maxLength={1000}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={!valid || addSkill.isPending}>
              {addSkill.isPending && <Loader2 className="animate-spin" />}
              Create skill
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
