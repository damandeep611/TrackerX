import AnalyticsHeader from "@/components/dashboard/analytics-components/AnalyticsHeader";
import DailyHoursChart from "@/components/dashboard/analytics-components/DailyHoursChart";
import DonutChart from "@/components/dashboard/analytics-components/DonutChart";
import React from "react";

export default function Page() {
  return (
    <div className="">
      <div>
        <AnalyticsHeader />
      </div>
      <div className="flex items-center justify-between gap-2">
        <DailyHoursChart />
        <DonutChart />
      </div>
    </div>
  );
}
