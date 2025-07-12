"use client";

import { useState, useEffect, useCallback } from "react";
import { getSkillAnalytics } from "@/actions/skillAnalyticsAction";

interface SkillAnalytics {
  averageDailyHours: number;
  totalDaysWithActivity: number;
  completedTasks: number;
  totalTasks: number;
  createdAt: string;
  description: string | null;
  daysSinceCreation: number;
}

interface UseSkillAnalyticsReturn {
  analytics: SkillAnalytics;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useSkillAnalytics(skillId: string): UseSkillAnalyticsReturn {
  const [analytics, setAnalytics] = useState<SkillAnalytics>({
    averageDailyHours: 0,
    totalDaysWithActivity: 0,
    completedTasks: 0,
    totalTasks: 0,
    createdAt: "",
    description: null,
    daysSinceCreation: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!skillId) {
      setError("Skill ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getSkillAnalytics(skillId);

      // Validate the data
      if (!data.createdAt) {
        throw new Error("Invalid skill data received");
      }

      setAnalytics({
        ...data,
        createdAt: data.createdAt,
        description: data.description || null,
        daysSinceCreation: data.daysSinceCreation,
      });
    } catch (err) {
      console.error("Failed to fetch skill analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  }, [skillId]);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      if (!skillId) {
        if (isMounted) {
          setError("Skill ID is required");
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const data = await getSkillAnalytics(skillId);

        // Validate the data
        if (!data.createdAt) {
          throw new Error("Invalid skill data received");
        }

        if (isMounted) {
          setAnalytics({
            ...data,
            createdAt: data.createdAt,
            description: data.description || null,
            daysSinceCreation: data.daysSinceCreation,
          });
        }
      } catch (err) {
        console.error("Failed to fetch skill analytics:", err);
        if (isMounted) {
          setError("Failed to load analytics data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [skillId]);

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
  };
}
