"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import React from "react";
import { LabelList, Pie, PieChart } from "recharts";
import { motion } from "framer-motion";
import { useTagStats } from "@/hooks/useTagStats";
import { Tag } from "lucide-react";

interface SkillAnalyticsProps {
  skillId: string;
  onRefresh?: () => void;
}

// Generate colors for tags
const tagColors = [
  "var(--chart-1)", // Blue
  "var(--chart-2)", // Green
  "var(--chart-3)", // Purple
  "var(--chart-4)", // Orange
  "var(--chart-5)", // Red
];

export default function SkillAnalytics({ skillId }: SkillAnalyticsProps) {
  const { tagStats, isLoading, error } = useTagStats(skillId);

  // Transform tag stats into chart data
  const chartData = tagStats.map((tagStat, index) => ({
    tag: tagStat.tag,
    count: tagStat.count,
    fill: tagColors[index % tagColors.length],
  }));

  // Create chart config dynamically
  const chartConfig: ChartConfig = {
    count: {
      label: "Count",
    },
    ...tagStats.reduce((acc, tagStat, index) => {
      acc[tagStat.tag] = {
        label: tagStat.tag,
        color: tagColors[index % tagColors.length],
      };
      return acc;
    }, {} as Record<string, { label: string; color: string }>),
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="w-96 p-2  "
      >
        <div className="flex items-center justify-center p-4">
          <h3 className="text-xl font-bold">Skill Analytics</h3>
        </div>
        <div>
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Tag Distribution</CardTitle>
              <CardDescription>Loading...</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <div className="h-[250px] flex items-center justify-center">
                <div className="text-sm text-muted-foreground">
                  Loading chart...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="w-96 p-2  ">
        <div className="flex items-center justify-center p-4">
          <h3 className="text-xl font-bold">Skill Analytics</h3>
        </div>
        <div>
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Tag Distribution</CardTitle>
              <CardDescription>Error loading data</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <div className="h-[250px] flex items-center justify-center">
                <div className="text-sm text-red-500">{error}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className=" w-96 p-2  "
      >
        <div className="flex items-center justify-center p-4">
          <h3 className="text-xl font-bold">Skill Analytics</h3>
        </div>
        <div>
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Tag Distribution</CardTitle>
              <CardDescription>No tags found</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <div className="h-[250px] flex items-center justify-center">
                <div className="text-sm text-muted-foreground">
                  No tags have been added to tasks yet
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.5 }}
      className=" w-96 h-fit p-4 rounded-3xl hover:border-black/20 dark:hover:border-white/20 transition-colors   
        dark:bg-[#0e0e0f] bg-white
        border dark:border-white/[0.06] border-black/[0.06]
        shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05),0px_8px_20px_-4px_rgba(0,0,0,0.1)]
        dark:shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_8px_20px_-4px_rgba(0,0,0,0.3)]   "
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-widest text-neutral-500">
          Distribution
        </h3>
        <Tag size={16} className="text-neutral-400" />
      </div>
      <div className=" p-4 rounded-2xl shadow-sm mb-6 ">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square "
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="count" hideLabel />}
            />
            <Pie data={chartData} dataKey="count">
              <LabelList
                dataKey="tag"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: string) =>
                  chartConfig[value]?.label || value
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      {/* custom legened */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {chartData.map((item) => (
          <div
            key={item.tag}
            className="flex items-center gap-1.5 rounded-md border border-black/5 bg-black/5 px-2 py-1 dark:border-white/5 dark:bg-white/5"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: item.fill }}
            />
            <span className="text-xs text-neutral-600 dark:text-neutral-300">
              {item.tag}
            </span>
            <span className="ml-1 text-[10px] text-neutral-400 dark:text-neutral-500">
              ({item.count})
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
