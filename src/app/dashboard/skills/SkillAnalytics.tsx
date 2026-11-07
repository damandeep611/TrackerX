"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React, { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { motion } from "motion/react";
import { useTagStats } from "@/hooks/useTagStats";
import { Tag } from "lucide-react";

interface SkillAnalyticsProps {
  skillId: string;
  onRefresh?: () => void;
}

// Generate colors for tags
const tagColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export default function SkillAnalytics({ skillId }: SkillAnalyticsProps) {
  const { tagStats, isLoading, error } = useTagStats(skillId);

  // Transform tag stats into chart data
  const chartData = useMemo(() => {
    return tagStats.map((tagStat, index) => ({
      tag: tagStat.tag,
      count: tagStat.count,
      fill: tagColors[index % tagColors.length],
    }));
  }, [tagStats]);

  const totalTags = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  // Create chart config dynamically
  const chartConfig: ChartConfig = useMemo(() => {
    return {
      count: {
        label: "Count",
      },
      ...tagStats.reduce(
        (acc, tagStat, index) => {
          acc[tagStat.tag] = {
            label: tagStat.tag,
            color: tagColors[index % tagColors.length],
          };
          return acc;
        },
        {} as Record<string, { label: string; color: string }>,
      ),
    };
  }, [tagStats]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-xs h-fit border-border bg-card shadow-sm">
        <CardHeader className="items-center pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-62.5">
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-xs h-fit border-border bg-card shadow-sm">
        <CardHeader className="items-center pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-destructive">
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-62.5">
          <div className="text-sm text-muted-foreground">
            Failed to load analytics
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className="w-full max-w-xs h-fit border-border bg-card shadow-sm">
        <CardHeader className="items-center pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-62.5">
          <div className="text-sm text-muted-foreground text-center px-4">
            No tags found. Add tags to your tasks to see the breakdown.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full max-w-xs"
    >
      <Card className="flex flex-col border-border bg-card shadow-sm h-fit overflow-hidden">
        <CardHeader className="items-center pb-0 pt-4 px-3">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-text-tertiary" />
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
              Tag Distribution
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pb-4 pt-0 px-3">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-55 w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="tag"
                innerRadius={75}
                outerRadius={100}
                strokeWidth={5}
                stroke="var(--card)"
                paddingAngle={2}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-primary text-2xl font-bold"
                          >
                            {totalTags.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 20}
                            className="fill-text-tertiary text-[10px] font-medium uppercase tracking-tighter"
                          >
                            Tags
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {chartData.map((item) => (
              <div
                key={item.tag}
                className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2 py-0.5 transition-all hover:bg-surface-highlight group"
              >
                <div
                  className="h-1.5 w-1.5 rounded-full shadow-[0_0_4px_rgba(0,0,0,0.1)] group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-[10px] font-medium text-text-secondary">
                  {item.tag}
                </span>
                <span className="text-[9px] text-text-tertiary">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
