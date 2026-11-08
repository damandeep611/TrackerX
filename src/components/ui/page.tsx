import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Every dashboard page:
 *   <PageShell>
 *     <PageHeader title="…" description="…" actions={…} />
 *     …sections
 *   </PageShell>
 */

function PageShell({
  className,
  width = "default",
  ...props
}: React.ComponentProps<"div"> & { width?: "default" | "wide" | "narrow" }) {
  const widths = { narrow: "max-w-3xl", default: "max-w-7xl", wide: "max-w-[1600px]" }
  return (
    <div
      data-slot="page-shell"
      className={cn(
        "mx-auto w-full space-y-6 px-4 py-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-500 sm:px-6 lg:py-8",
        widths[width],
        className
      )}
      {...props}
    />
  )
}

function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  /** Small line above the title (breadcrumb, date…). */
  eyebrow?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <header
      data-slot="page-header"
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div className="min-w-0 space-y-1">
        {eyebrow && <div className="text-xs text-muted-foreground">{eyebrow}</div>}
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}

/** Section heading inside a page ("Skills", "Recent sessions"). */
function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export { PageShell, PageHeader, SectionHeader }
