"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useTrackerActions, useTrackerDay, useTrackerHistory } from "@/hooks/useTracker";
import { TrackerSkeleton } from "./TrackerSkeleton";
import { TrackerView, type TrackerTab } from "./TrackerView";

/**
 * /dashboard/tracker on React Query. The open day and tab live in the URL
 * (`?date=`, `?tab=history`) through history.replaceState, so switching days
 * doesn't re-render the server page.
 */
export function TrackerPage({
  today,
  initialDate,
  initialTab,
}: {
  today: string;
  initialDate: string;
  initialTab: TrackerTab;
}) {
  const [date, setDate] = useState(initialDate);
  const [tab, setTab] = useState<TrackerTab>(initialTab);
  const dayQuery = useTrackerDay(date);
  const historyQuery = useTrackerHistory(tab === "history");
  const actions = useTrackerActions(date);

  const syncUrl = (nextDate: string, nextTab: TrackerTab) => {
    const params = new URLSearchParams();
    if (nextDate !== today) params.set("date", nextDate);
    if (nextTab === "history") params.set("tab", "history");
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  if (!dayQuery.data) {
    if (dayQuery.isError) {
      return (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          <EmptyState
            icon={<AlertCircle />}
            title="Couldn't load this day"
            description="Check your connection and try again."
            action={
              <Button variant="outline" onClick={() => dayQuery.refetch()}>
                Try again
              </Button>
            }
          />
        </div>
      );
    }
    return <TrackerSkeleton />;
  }

  return (
    <TrackerView
      today={today}
      day={dayQuery.data.day}
      carryIn={dayQuery.data.carryIn}
      history={historyQuery.data ?? []}
      loading={dayQuery.isPlaceholderData}
      historyLoading={tab === "history" && !historyQuery.data}
      actions={actions}
      tab={tab}
      onTab={(t) => {
        setTab(t);
        syncUrl(date, t);
      }}
      onNavigate={(d) => {
        setDate(d);
        syncUrl(d, tab);
      }}
    />
  );
}
