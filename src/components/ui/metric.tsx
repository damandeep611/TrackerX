"use client"

import * as React from "react"
import { animate, useInView, useReducedMotion } from "motion/react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/* -------------------------------------------------------------------------- */
/* AnimatedNumber: counts up to `value` once it scrolls into view.           */
/* -------------------------------------------------------------------------- */

function AnimatedNumber({
  value,
  decimals = 0,
  duration = 0.8,
  className,
  format,
}: {
  value: number
  decimals?: number
  duration?: number
  className?: string
  format?: (n: number) => string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const fmt = React.useCallback(
    (n: number) =>
      format
        ? format(n)
        : n.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }),
    [format, decimals]
  )
  const from = React.useRef(0)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduce || !inView) {
      node.textContent = fmt(reduce ? value : from.current)
      if (reduce) from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = fmt(v)
      },
    })
    from.current = value
    return () => controls.stop()
  }, [value, inView, reduce, duration, fmt])

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {fmt(reduce ? value : 0)}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* MetricValue: big monospace number with a muted unit ("124 k", "850 ms").    */
/* -------------------------------------------------------------------------- */

function MetricValue({
  value,
  unit,
  prefix,
  decimals = 0,
  animated = true,
  size = "lg",
  className,
}: {
  value: number | string
  unit?: string
  prefix?: string
  decimals?: number
  animated?: boolean
  size?: "md" | "lg" | "xl"
  className?: string
}) {
  const sizes = { md: "text-2xl", lg: "text-[32px] leading-none", xl: "text-5xl leading-none" }
  return (
    <div className={cn("flex items-baseline gap-1 text-foreground", className)}>
      {prefix && <span className="text-lg text-muted-foreground">{prefix}</span>}
      {typeof value === "number" && animated ? (
        <AnimatedNumber value={value} decimals={decimals} className={cn(sizes[size], "font-medium")} />
      ) : (
        <span className={cn("tabular font-medium", sizes[size])}>
          {typeof value === "number" ? value.toFixed(decimals) : value}
        </span>
      )}
      {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* DeltaChip: "▲ +12%  vs last week". Green when good, red when bad.          */
/* -------------------------------------------------------------------------- */

function DeltaChip({
  value,
  suffix = "%",
  label,
  invert = false,
  precision = 0,
  className,
}: {
  /** Signed change. Positive = increase. */
  value: number
  suffix?: string
  /** Muted text after the chip, e.g. "vs last week". */
  label?: string
  /** Set when a decrease is good (e.g. latency). */
  invert?: boolean
  precision?: number
  className?: string
}) {
  const rounded = Number(value.toFixed(precision))
  const flat = rounded === 0
  const good = flat ? null : (rounded > 0) !== invert
  const Icon = flat ? Minus : rounded > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span
        className={cn(
          "tabular inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
          good === null && "bg-surface-2 text-muted-foreground",
          good === true && "bg-success-soft text-success",
          good === false && "bg-danger-soft text-danger"
        )}
      >
        <Icon className="size-3" aria-hidden />
        {rounded > 0 ? "+" : ""}
        {rounded.toFixed(precision)}
        {suffix}
      </span>
      {label && <span className="text-muted-foreground">{label}</span>}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* BarSparkline: small inline bar chart (no axes).                            */
/* -------------------------------------------------------------------------- */

function BarSparkline({
  data,
  color = "var(--brand)",
  highlightLast = true,
  height = 36,
  className,
  label,
}: {
  data: number[]
  /** Any CSS color; prefer tokens like var(--chart-2). */
  color?: string
  highlightLast?: boolean
  height?: number
  className?: string
  /** Accessible description, e.g. "Hours per day, last 7 days". */
  label?: string
}) {
  const max = Math.max(...data, 0)
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("flex items-end gap-[3px]", className)}
      style={{ height }}
    >
      {data.map((v, i) => {
        const pct = max > 0 ? Math.max((v / max) * 100, 6) : 6
        const isLast = i === data.length - 1
        return (
          <span
            key={i}
            className="w-[5px] origin-bottom rounded-[2px] transition-[height] duration-500 ease-out"
            style={{
              height: `${pct}%`,
              background: color,
              opacity: v === 0 ? 0.18 : highlightLast && !isLast ? 0.55 : 1,
            }}
          />
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* SegmentedProgress: row of ticks, filled up to `value / max`.               */
/* -------------------------------------------------------------------------- */

function SegmentedProgress({
  value,
  max = 100,
  segments = 40,
  color = "var(--brand)",
  height = 28,
  markers,
  className,
  label,
}: {
  value: number
  max?: number
  segments?: number
  color?: string
  height?: number
  /** Values where a milestone tick is drawn taller (e.g. every 20h of 80). */
  markers?: number[]
  className?: string
  label?: string
}) {
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0
  const filled = Math.round(ratio * segments)
  const markerIdx = new Set((markers ?? []).map((m) => Math.round((m / max) * segments) - 1))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={cn("flex items-end gap-[3px]", className)}
      style={{ height }}
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "flex-1 rounded-[2px] transition-colors duration-300",
            i >= filled && "bg-border-strong/70"
          )}
          style={{
            height: markerIdx.has(i) ? "100%" : "78%",
            background: i < filled ? color : undefined,
            transitionDelay: `${i * 8}ms`,
          }}
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* ProgressBar: thin continuous bar.                                          */
/* -------------------------------------------------------------------------- */

function ProgressBar({
  value,
  max = 100,
  color = "var(--brand)",
  className,
  label,
}: {
  value: number
  max?: number
  color?: string
  className?: string
  label?: string
}) {
  const pct = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-surface-3", className)}
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

export { AnimatedNumber, MetricValue, DeltaChip, BarSparkline, SegmentedProgress, ProgressBar }
