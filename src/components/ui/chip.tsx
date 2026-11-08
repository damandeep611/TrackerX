import * as React from "react"

import { cn } from "@/lib/utils"

/** Small pill toggle for one-click choices (presets, categories). */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-7 rounded-full border px-2.5 text-xs transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        active
          ? "border-transparent bg-brand-soft text-brand"
          : "border-border bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

export { Chip }
