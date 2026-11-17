"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { formatMaybe, parseTrackerDuration } from "@/lib/tracker";
import { cn } from "@/lib/utils";

/**
 * Text that edits in place: looks like plain text, becomes a field on hover /
 * focus. Commits on blur or Enter (Shift+Enter = new line when multiline),
 * Escape reverts. No save button anywhere.
 */
export function InlineText({
  value,
  onCommit,
  placeholder,
  multiline = false,
  required = false,
  readOnly = false,
  maxLength = 500,
  className,
  "aria-label": ariaLabel,
  onEnter,
}: {
  value: string | null;
  onCommit: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  /** Empty input reverts instead of committing "". */
  required?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  className?: string;
  "aria-label": string;
  /** Called after Enter commits (e.g. focus the next field). */
  onEnter?: () => void;
}) {
  // null = not editing, so the prop is shown; no syncing effect needed.
  const [draft, setDraft] = useState<string | null>(null);
  const cancelled = useRef(false);
  const shown = draft ?? value ?? "";

  const commit = () => {
    const next = (draft ?? "").trim();
    const wasEditing = draft !== null;
    setDraft(null);
    if (!wasEditing || cancelled.current) {
      cancelled.current = false;
      return;
    }
    if (required && !next) return;
    if (next !== (value ?? "")) onCommit(next);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      cancelled.current = true;
      e.currentTarget.blur();
    } else if (e.key === "Enter" && !(multiline && e.shiftKey) && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.blur();
      onEnter?.();
    }
  };

  const base = cn(
    "-mx-1.5 w-[calc(100%+0.75rem)] min-w-0 rounded-md bg-transparent px-1.5 py-0.5 outline-none transition-[background-color,box-shadow] duration-150",
    "placeholder:text-subtle-foreground",
    !readOnly && "hover:bg-surface-3/70 focus:bg-card focus:shadow-panel focus:ring-1 focus:ring-border-strong dark:focus:bg-surface-3",
    readOnly && "cursor-default",
    className
  );

  const common = {
    value: shown,
    readOnly,
    maxLength,
    placeholder: readOnly ? undefined : placeholder,
    "aria-label": ariaLabel,
    onFocus: () => !readOnly && setDraft(value ?? ""),
    onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown,
    spellCheck: draft !== null,
  };

  return multiline ? (
    <textarea rows={1} {...common} className={cn(base, "block resize-none field-sizing-content")} />
  ) : (
    <input type="text" {...common} className={base} />
  );
}

/**
 * A duration cell: shows "1h 30m", accepts "90", "1.5h", "1:45", "1 hour 30 min".
 * Empty clears it. Unreadable input flashes and reverts.
 */
export function DurationField({
  value,
  onCommit,
  placeholder = "—",
  max,
  readOnly = false,
  className,
  "aria-label": ariaLabel,
  onEnter,
}: {
  value: number | null;
  onCommit: (minutes: number | null) => void;
  placeholder?: string;
  max?: number;
  readOnly?: boolean;
  className?: string;
  "aria-label": string;
  onEnter?: () => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const cancelled = useRef(false);

  const commit = () => {
    const raw = (draft ?? "").trim();
    const wasEditing = draft !== null;
    setDraft(null);
    if (!wasEditing || cancelled.current) {
      cancelled.current = false;
      return;
    }
    if (!raw) {
      if (value !== null) onCommit(null);
      return;
    }
    const minutes = parseTrackerDuration(raw, max);
    if (minutes === null) {
      setInvalid(true);
      setTimeout(() => setInvalid(false), 900);
      return;
    }
    if (minutes !== value) onCommit(minutes);
  };

  return (
    <input
      type="text"
      inputMode="text"
      value={draft ?? formatMaybe(value, "")}
      readOnly={readOnly}
      placeholder={readOnly ? "—" : placeholder}
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      title={readOnly ? undefined : "e.g. 45m, 1h 30m, 1:45"}
      onFocus={(e) => {
        if (readOnly) return;
        setDraft(formatMaybe(value, ""));
        requestAnimationFrame(() => e.target.select());
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          cancelled.current = true;
          e.currentTarget.blur();
        } else if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
          onEnter?.();
        }
      }}
      className={cn(
        "tabular h-7 w-[4.75rem] rounded-md bg-transparent px-1.5 text-right text-[13px] text-foreground outline-none transition-[background-color,box-shadow] duration-150",
        "placeholder:text-subtle-foreground",
        !readOnly && "hover:bg-surface-3/70 focus:bg-card focus:shadow-panel focus:ring-1 focus:ring-border-strong dark:focus:bg-surface-3",
        readOnly && "cursor-default",
        invalid && "animate-[tracker-shake_0.3s_ease-in-out] ring-1 ring-danger/60",
        className
      )}
    />
  );
}
