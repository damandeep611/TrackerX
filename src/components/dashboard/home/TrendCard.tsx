"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import { Card, CardAction, CardFooter, CardHeader, CardTitle, Well } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyProgress } from "@/hooks/useDashboardAnalytics";
import { formatHours, type DashboardInsights } from "@/lib/insights";

type Range = "weeks" | "days";
type Row = { key: string; label: string; detail: string; hours: number; current: boolean };

const chartConfig = { hours: { label: "Hours", color: "var(--chart-1)" } } satisfies ChartConfig;

const shortDate = (key: string) =>
  new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

export function TrendCard({ insights }: { insights: DashboardInsights }) {
  const [range, setRange] = useState<Range>("weeks");
  const weekly = useWeeklyProgress();

  const rows: Row[] =
    range === "weeks"
      ? (weekly.data ?? []).map((w, i, all) => ({
          key: w.weekStart,
          label: i === all.length - 1 ? "This wk" : shortDate(w.weekStart),
          detail: `${shortDate(w.weekStart)} – ${shortDate(w.weekEnd)}`,
          hours: w.hours,
          current: i === all.length - 1,
        }))
      : insights.daily28.map((d, i, all) => ({
          key: d.date,
          label: shortDate(d.date),
          detail: new Date(`${d.date}T00:00:00Z`).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          }),
          hours: Math.round((d.minutes / 60) * 10) / 10,
          current: i === all.length - 1,
        }));

  // Footer: average over completed periods (the current one is partial).
  const past = rows.filter((r) => !r.current);
  const activePast = range === "days" ? past.filter((r) => r.hours > 0) : past;
  const avgHours = activePast.length
    ? activePast.reduce((a, r) => a + r.hours, 0) / activePast.length
    : 0;
  const footer =
    range === "weeks"
      ? `Avg ${formatHours(avgHours * 60)} per full week`
      : `Avg ${formatHours(avgHours * 60)} on active days`;

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>
          <BarChart3 />
          Hours trend
        </CardTitle>
        <CardAction>
          <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
            <TabsList className="h-8">
              <TabsTrigger value="weeks" className="text-xs">
                7 weeks
              </TabsTrigger>
              <TabsTrigger value="days" className="text-xs">
                28 days
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardAction>
      </CardHeader>
      <Well className="flex flex-1 flex-col justify-end px-2 pt-4 pb-1">
        {range === "weeks" && weekly.isPending ? (
          <Skeleton className="h-56 w-full rounded-lg" />
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
            <BarChart data={rows} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={11}
                interval={range === "days" ? 6 : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                fontSize={11}
                width={40}
                tickFormatter={(v: number) => `${v}h`}
              />
              <ChartTooltip
                cursor={{ fill: "var(--surface-3)", radius: 6 }}
                content={({ active, payload }) => {
                  const row = payload?.[0]?.payload as Row | undefined;
                  if (!active || !row) return null;
                  return (
                    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-raised">
                      <div className="text-muted-foreground">{row.detail}</div>
                      <div className="tabular mt-0.5 font-medium text-foreground">
                        {formatHours(row.hours * 60)}
                        {row.current && (
                          <span className="ml-1 font-sans font-normal text-muted-foreground">
                            so far
                          </span>
                        )}
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="hours" radius={[4, 4, 1, 1]} maxBarSize={range === "weeks" ? 44 : 14}>
                {rows.map((r) => (
                  <Cell
                    key={r.key}
                    fill="var(--color-hours)"
                    fillOpacity={r.current ? 1 : 0.45}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </Well>
      <CardFooter>
        <span>{footer}</span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-chart-1" aria-hidden />
          {range === "weeks" ? "This week" : "Today"}
        </span>
      </CardFooter>
    </Card>
  );
}
