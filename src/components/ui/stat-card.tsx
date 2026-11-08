import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardAction, CardFooter, CardHeader, CardTitle, Well } from "./card"
import { BarSparkline, DeltaChip, MetricValue } from "./metric"

/**
 * KPI card from the design reference:
 *   ┌ icon  Title ······························ action ┐
 *   │ ┌ 124 k ·························· ▂▅▃▇▆█ ┐      │
 *   │ └───────────────────────────────────────────┘      │
 *   └ caption ················ ▲ +15% vs last week ┘
 */
function StatCard({
  icon,
  title,
  value,
  unit,
  prefix,
  decimals,
  sparkline,
  color = "var(--brand)",
  delta,
  deltaLabel = "vs last week",
  invertDelta,
  caption,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  value: number | string
  unit?: string
  prefix?: string
  decimals?: number
  /** Values for the inline bar chart (oldest → newest). */
  sparkline?: number[]
  /** Accent for this metric; prefer var(--chart-N). */
  color?: string
  /** Signed % change; omit to hide the chip. */
  delta?: number
  deltaLabel?: string
  invertDelta?: boolean
  caption?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>
          {icon}
          {title}
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <Well className="flex items-end justify-between gap-4 py-3.5">
        <MetricValue value={value} unit={unit} prefix={prefix} decimals={decimals} />
        {sparkline && sparkline.length > 0 && (
          <BarSparkline data={sparkline} color={color} label={`${title} trend`} />
        )}
      </Well>
      {(caption || delta !== undefined) && (
        <CardFooter>
          <span className="truncate">{caption}</span>
          {delta !== undefined && (
            <DeltaChip value={delta} label={deltaLabel} invert={invertDelta} />
          )}
        </CardFooter>
      )}
    </Card>
  )
}

export { StatCard }

/** Grid wrapper for a row of StatCards. */
export function StatGrid({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      {...props}
    />
  )
}
