"use client";

import { useState, type KeyboardEvent } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const MAX_TAGS = 5;

/**
 * Tag field with one-click chips: the skill's recent tags plus a few suggested
 * ones (most used across all skills). Typing filters the chips; Enter or comma
 * adds the highlighted match or a new tag; Backspace on empty removes the last.
 */
export function TagPicker({
  value,
  onChange,
  recent = [],
  suggested = [],
  id,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  recent?: string[];
  suggested?: string[];
  id?: string;
}) {
  const [text, setText] = useState("");
  const query = text.trim().toLowerCase();
  const full = value.length >= MAX_TAGS;

  const chips = [
    ...recent.map((tag) => ({ tag, suggested: false })),
    ...suggested.filter((t) => !recent.includes(t)).map((tag) => ({ tag, suggested: true })),
  ].filter((c) => !value.includes(c.tag) && (!query || c.tag.toLowerCase().includes(query)));

  const add = (tag: string) => {
    const t = tag.trim().slice(0, 50);
    if (!t || full || value.some((v) => v.toLowerCase() === t.toLowerCase())) return;
    onChange([...value, t]);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      if (!text.trim()) return; // let Enter submit the form
      e.preventDefault();
      const exact = chips.find((c) => c.tag.toLowerCase() === query);
      add(exact?.tag ?? text);
    } else if (e.key === "Backspace" && !text && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-input bg-card px-2 py-1.5 focus-within:border-border-strong focus-within:ring-[3px] focus-within:ring-ring/40">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex h-6 items-center gap-1 rounded-full bg-brand-soft pr-1 pl-2.5 text-xs text-brand"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="rounded-full p-0.5 hover:bg-brand/15"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={full}
          placeholder={full ? `Up to ${MAX_TAGS} tags` : value.length ? "Add another…" : "Type a tag, Enter to add"}
          className="h-6 min-w-28 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle-foreground disabled:cursor-not-allowed"
          maxLength={50}
        />
      </div>
      {!full && (chips.length > 0 || query) && (
        <div className="flex flex-wrap gap-1.5">
          {chips.slice(0, 9).map((c) => (
            <button
              key={c.tag}
              type="button"
              onClick={() => add(c.tag)}
              className="inline-flex h-6 items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 text-xs text-muted-foreground transition-colors outline-none hover:bg-surface-3 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
              title={c.suggested ? "Suggested: one of your most used tags" : "Recently used on this skill"}
            >
              {c.suggested && <Sparkles className="size-3 text-brand" aria-hidden />}
              {c.tag}
            </button>
          ))}
          {query && !chips.some((c) => c.tag.toLowerCase() === query) && (
            <button
              type="button"
              onClick={() => add(text)}
              className={cn(
                "inline-flex h-6 items-center gap-1 rounded-full border border-dashed border-border-strong px-2.5 text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
              )}
            >
              <Plus className="size-3" aria-hidden />
              Create “{text.trim()}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
