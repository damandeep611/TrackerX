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
import { useTagStats } from "@/hooks/useTagStats";

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
      <div className=" p-2">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className=" p-2">
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
      <div className=" p-2">
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
      </div>
    );
  }

  return (
    <div className=" p-2">
      <div className="flex items-center justify-center p-4">
        <h3 className="text-xl font-bold">Skill Analytics</h3>
      </div>
      <div>
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Tag Distribution</CardTitle>
            <CardDescription>Most used tags in tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={chartConfig}
              className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
