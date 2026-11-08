"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/page";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillCard, {
  getSkillStatus,
  type SkillStatus,
} from "@/components/dashboard/skillcardComponents/skill-card";
import { formatHours, type DashboardInsights } from "@/lib/insights";
import { listItem, stagger } from "@/lib/motion";
import type { SkillListItem } from "@/hooks/useSkills";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "idle", label: "Idle" },
  { value: "done", label: "Completed" },
] as const;
type Filter = (typeof FILTERS)[number]["value"];

const matches = (filter: Filter, status: SkillStatus) =>
  filter === "all" ||
  (filter === "idle" ? status === "idle" || status === "new" : filter === status);

export function SkillsSection({
  skills,
  insights,
  onAddSkill,
}: {
  skills: SkillListItem[];
  insights?: DashboardInsights;
  onAddSkill: () => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const today = insights?.today ?? new Date().toISOString().slice(0, 10);

  const withStatus = skills.map((skill) => {
    const activity = insights?.skills[skill.id];
    return { skill, activity, status: getSkillStatus(skill, activity) };
  });
  const counts = Object.fromEntries(
    FILTERS.map((f) => [f.value, withStatus.filter((s) => matches(f.value, s.status)).length])
  ) as Record<Filter, number>;
  const visible = withStatus.filter((s) => matches(filter, s.status));
  const totalMinutes = skills.reduce((a, s) => a + s.currentHours * 60, 0);

  if (skills.length === 0) {
    return (
      <section className="space-y-4">
        <SectionHeader title="Skills" />
        <EmptyState
          icon={<Sprout />}
          title="No skills yet"
          description="Add a skill you want to get better at, set a target in hours, and start logging time against it."
          action={
            <Button variant="brand" onClick={onAddSkill}>
              <Plus />
              Add your first skill
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Skills"
        description={`${skills.length} ${skills.length === 1 ? "skill" : "skills"} · ${formatHours(totalMinutes)} logged in total`}
        actions={
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList className="h-8">
              {FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className="gap-1 px-2.5 text-xs">
                  {f.label}
                  <span className="tabular text-subtle-foreground">{counts[f.value]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        className="flex-wrap"
      />

      <motion.div
        variants={stagger(0.04)}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map(({ skill, activity }) => (
            <motion.div key={skill.id} layout variants={listItem} exit="exit">
              <SkillCard skill={skill} activity={activity} today={today} />
            </motion.div>
          ))}
          {filter === "all" && (
            <motion.div key="__add" layout variants={listItem}>
              <button
                type="button"
                onClick={onAddSkill}
                className="group flex h-full min-h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong/70 text-muted-foreground transition-colors outline-none hover:border-border-strong hover:bg-card/60 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-2 transition-transform duration-200 group-hover:scale-105">
                  <Plus className="size-4" />
                </span>
                <span className="text-sm font-medium">Add a skill</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {visible.length === 0 && filter !== "all" && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No {FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} skills right now.
        </p>
      )}
    </section>
  );
}
