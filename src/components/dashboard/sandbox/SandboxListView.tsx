"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Box, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader, PageShell } from "@/components/ui/page";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSandboxes } from "@/hooks/useSandbox";
import { formatHours } from "@/lib/insights";
import { listItem, stagger } from "@/lib/motion";
import { SandboxCard } from "./SandboxCard";
import { CreateSandboxDialog } from "./SandboxDialogs";

/** /dashboard/sandbox: every deep-work project, with one-tap logging on each card. */
export default function SandboxListView() {
  const { data, isPending, isError, refetch } = useSandboxes();
  const [creating, setCreating] = useState(false);
  const list = data?.sandboxes ?? [];
  const week = list.reduce((a, s) => a + s.minutes7d, 0);

  return (
    <TooltipProvider>
      <PageShell>
        <PageHeader
          title="Sandboxes"
          description={
            list.length > 0
              ? `${list.length} ${list.length === 1 ? "project" : "projects"} · ${formatHours(week)} logged in the last 7 days`
              : "Open-ended deep-work projects with an hour target and a milestone every 20h."
          }
          actions={
            <Button variant="brand" onClick={() => setCreating(true)}>
              <Plus />
              New sandbox
            </Button>
          }
        />

        {isError ? (
          <EmptyState
            compact
            icon={<AlertCircle />}
            title="Couldn't load your sandboxes"
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            }
          />
        ) : isPending ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-60 rounded-2xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <EmptyState
            icon={<Box />}
            title="No sandboxes yet"
            description="Start a project you want to sink real hours into, set a target, and log sessions as you go."
            action={
              <Button variant="brand" onClick={() => setCreating(true)}>
                <Plus />
                Create your first sandbox
              </Button>
            }
          />
        ) : (
          <motion.div
            variants={stagger(0.04)}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((s) => (
                <motion.div key={s.id} layout variants={listItem} exit="exit">
                  <SandboxCard sandbox={s} today={data!.today} />
                </motion.div>
              ))}
              <motion.div key="__add" layout variants={listItem}>
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="group flex h-full min-h-56 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong/70 text-muted-foreground transition-colors outline-none hover:border-border-strong hover:bg-card/60 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
                >
                  <span className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-2 transition-transform duration-200 group-hover:scale-105">
                    <Plus className="size-4" />
                  </span>
                  <span className="text-sm font-medium">New sandbox</span>
                </button>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        <CreateSandboxDialog open={creating} onOpenChange={setCreating} />
      </PageShell>
    </TooltipProvider>
  );
}
