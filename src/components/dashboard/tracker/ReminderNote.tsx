"use client";

import { Pencil } from "lucide-react";
import { InlineText } from "./fields";

/** The note to self at the top of every day. Carried forward to new days. */
export function ReminderNote({
  value,
  onChange,
  readOnly,
}: {
  value: string | null;
  onChange: (next: string) => void;
  readOnly?: boolean;
}) {
  if (readOnly && !value) return null;
  return (
    <div className="group relative border-l-2 border-chart-2/70 pl-3.5">
      <InlineText
        value={value}
        onCommit={onChange}
        multiline
        readOnly={readOnly}
        maxLength={400}
        placeholder="Write a note to yourself. It stays at the top of every day."
        aria-label="Reminder"
        className="pr-7 text-sm leading-relaxed text-muted-foreground focus:text-foreground"
      />
      {!readOnly && (
        <Pencil
          aria-hidden
          className="pointer-events-none absolute top-1.5 right-1 size-3.5 text-subtle-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-0"
        />
      )}
    </div>
  );
}
