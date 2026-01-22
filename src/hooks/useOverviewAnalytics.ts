"use client";

import { useState, useEffect, useCallback } from "react";
import { getOverviewAnalytics } from "@/actions/overviewAnalyticsAction";

interface OverviewAnalytics {
  timeSpentYesterday: { hoursSpent: number; tasksCompleted: number };
  weeklyTime: { totalHours: number; daysWithActivity: number };
  monthlyTime: {totalHours: number; daysWithActivity: number};
  mostActiveSkill: { skillName: string; hoursSpent: number };
}

interface UseOverviewAnalyticsReturn {
  analytics: OverviewAnalytics;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useOverviewAnalytics(): UseOverviewAnalyticsReturn {
  const [analytics, setAnalytics] = useState<OverviewAnalytics>({
    timeSpentYesterday: { hoursSpent: 0, tasksCompleted: 0 },
    weeklyTime: { totalHours: 0, daysWithActivity: 0 },
    monthlyTime: {totalHours: 0, daysWithActivity: 0},
    mostActiveSkill: { skillName: "No data", hoursSpent: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOverviewAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("Failed to fetch overview analytics:", err);
      setError("Failed to load overview data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await getOverviewAnalytics();
        if (isMounted) {
          setAnalytics(data);
        }
      } catch (err) {
        console.error("Failed to fetch overview analytics:", err);
        if (isMounted) {
          setError("Failed to load overview data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
  };
}
