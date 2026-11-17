"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, Moon, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDuration } from "@/lib/duration";
import { listItem } from "@/lib/motion";
import { formatShortDate, shiftDate } from "@/lib/tracker";
import { cn } from "@/lib/utils";
import type { TrackerDay, TrackerDayActions } from "@/types/tracker";
import { DurationField, InlineText } from "./fields";

/**
 * End of day: what moves on, one thing learned, and tomorrow's list. Everything
 * saves as you type; tomorrow offers to import it when you open it.
 */
export function EndOfDayCard({
  day,
  readOnly,
  actions,
}: {
  day: TrackerDay;
  readOnly?: boolean;
  actions: Pick<
    TrackerDayActions,
    "updateDay" | "updateTask" | "addTomorrow" | "updateTomorrow" | "removeTomorrow"
  >;
}) {
  const open = day.tasks.filter((t) => !t.done);
  const done = day.tasks.length - open.length;
  const carried = open.filter((t) => t.carry);
  const tomorrowMinutes = day.tomorrow.reduce((a, t) => a + (t.estimateMinutes ?? 0), 0);
  const nextDay = formatShortDate(shiftDate(day.date, 1));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Moon />
          End of day
        </CardTitle>
        {day.tasks.length > 0 && (
          <CardAction className="text-xs text-muted-foreground">
            <span className="tabular">
              {done}/{day.tasks.length}
            </span>
            &nbsp;done
          </CardAction>
        )}
      </CardHeader>

      <Well className="divide-y divide-border/70 p-0">
        {/* Carry over */}
        <Section
          label="Carry over"
          hint={open.length > 0 ? `Ticked tasks are offered to ${nextDay}.` : undefined}
        >
          {open.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">
              {day.tasks.length === 0 ? "No tasks yet." : "Everything is done. Nothing to carry over."}
            </p>
          ) : (
            <ul className="space-y-1">
              {open.map((t) => (
                <li key={t.id}>
                  <label
                    className={cn(
                      "-mx-1.5 flex items-center gap-2.5 rounded-md px-1.5 py-1 text-[13px] transition-colors",
                      !readOnly && "cursor-pointer hover:bg-surface-3/70"
                    )}
                  >
                    <Checkbox
                      checked={t.carry}
                      disabled={readOnly}
                      onCheckedChange={(v) => actions.updateTask(t.id, { carry: v === true })}
                      className="data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground dark:data-[state=checked]:bg-brand"
                    />
                    <span className={cn("min-w-0 flex-1 truncate", t.carry ? "text-foreground" : "text-muted-foreground")}>
                      {t.title}
                    </span>
                    {t.estimateMinutes ? (
                      <span className="tabular text-xs text-subtle-foreground">{formatDuration(t.estimateMinutes)}</span>
                    ) : null}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* One thing learned */}
        <Section label="One thing I learned">
          <InlineText
            value={day.learned}
            onCommit={(learned) => actions.updateDay({ learned: learned || null })}
            multiline
            readOnly={readOnly}
            maxLength={1000}
            placeholder="What would you tell yourself tomorrow morning?"
            aria-label="One thing I learned"
            className={cn(
              "min-h-[3.25rem] text-[13px] leading-relaxed text-foreground",
              !readOnly && "bg-card/60 ring-1 ring-border/70 dark:bg-surface-3/30"
            )}
          />
          {readOnly && !day.learned && <p className="text-[13px] text-subtle-foreground">Nothing written.</p>}
        </Section>

        {/* Tomorrow */}
        <Section
          label={`Tomorrow · ${nextDay}`}
          meta={
            tomorrowMinutes > 0 || carried.length > 0
              ? [
                  tomorrowMinutes > 0 ? `${formatDuration(tomorrowMinutes)} planned` : null,
                  carried.length > 0 ? `+${carried.length} carried` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")
              : undefined
          }
        >
          <ol className="space-y-0.5">
            <AnimatePresence initial={false}>
              {day.tomorrow.map((item, i) => (
                <motion.li
                  key={item.id}
                  layout="position"
                  variants={listItem}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="group flex items-center gap-2"
                >
                  <span className="tabular w-4 shrink-0 text-right text-xs text-subtle-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <InlineText
                      value={item.title}
                      onCommit={(title) => actions.updateTomorrow(item.id, { title })}
                      required
                      readOnly={readOnly}
                      maxLength={200}
                      aria-label={`Tomorrow task ${i + 1}`}
                      className="text-[13px] text-foreground"
                    />
                  </div>
                  <DurationField
                    value={item.estimateMinutes}
                    onCommit={(m) => actions.updateTomorrow(item.id, { estimateMinutes: m })}
                    readOnly={readOnly}
                    placeholder="Est."
                    aria-label={`Estimate for ${item.title}`}
                    className="h-6 w-16 text-xs text-muted-foreground"
                  />
                  {!readOnly && (
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      aria-label={`Remove ${item.title}`}
                      onClick={() => actions.removeTomorrow(item.id)}
                      className="size-6 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                    >
                      <X />
                    </Button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
          {!readOnly && <AddTomorrowRow onAdd={actions.addTomorrow} empty={day.tomorrow.length === 0} />}
          {readOnly && day.tomorrow.length === 0 && (
            <p className="text-[13px] text-subtle-foreground">Nothing planned.</p>
          )}
        </Section>
      </Well>
    </Card>
  );
}

function Section({
  label,
  hint,
  meta,
  children,
}: {
  label: string;
  hint?: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2 px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
        {meta && <span className="text-[11px] text-subtle-foreground">{meta}</span>}
      </div>
      {children}
      {hint && <p className="text-[11px] text-subtle-foreground">{hint}</p>}
    </section>
  );
}

function AddTomorrowRow({ onAdd, empty }: { onAdd: TrackerDayActions["addTomorrow"]; empty: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const submit = () => {
    const t = title.trim();
    if (!t) return;
    onAdd({ title: t, estimateMinutes: null });
    setTitle("");
    ref.current?.focus();
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-center gap-2"
    >
      <Plus className="ml-1 size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
      <input
        ref={ref}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setTitle("")}
        maxLength={200}
        placeholder={empty ? "What's first tomorrow?" : "Add another…"}
        aria-label="Add a task for tomorrow"
        className="h-7 min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-subtle-foreground"
      />
      {title.trim() && (
        <Button type="submit" size="icon-xs" variant="ghost" aria-label="Add" className="size-6">
          <CornerDownLeft />
        </Button>
      )}
    </form>
  );
}
