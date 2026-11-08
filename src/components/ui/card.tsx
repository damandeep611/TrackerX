import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Panel-inside-panel system:
 *   <Card>            outer panel on the page canvas (bg-card, hairline border)
 *     <CardHeader>    title row: icon + title, optional <CardAction>
 *     <Well>          inner recessed panel (bg-surface-2) for the main content
 *     <CardFooter>    muted meta row ("+12% vs last week")
 */

function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-1.5 text-card-foreground shadow-panel",
        interactive &&
          "transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-raised",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex min-h-8 items-center gap-2 px-2.5 pt-1.5 has-data-[slot=card-action]:justify-between",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "flex items-center gap-2 text-sm font-medium text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("ml-auto flex shrink-0 items-center gap-1", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("px-2.5", className)} {...props} />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center justify-between gap-2 px-2.5 pb-1.5 text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Inner recessed panel. Nest inside a Card for the panel-in-panel look. */
function Well({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="well"
      className={cn("rounded-xl border border-border/60 bg-surface-2 p-4", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  Well,
}
