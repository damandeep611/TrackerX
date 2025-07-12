"use client";

import { useState, useEffect, useCallback } from "react";
import { getTagStatsForSkill } from "@/actions/skillAnalyticsAction";

interface TagStat {
  tag: string;
  count: number;
}

interface UseTagStatsReturn {
  tagStats: TagStat[];
  isLoading: boolean;
  error: string | null;
  refreshTagStats: () => Promise<void>;
}

export function useTagStats(skillId: string): UseTagStatsReturn {
  const [tagStats, setTagStats] = useState<TagStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTagStats = useCallback(async () => {
    if (!skillId) {
      setError("Skill ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getTagStatsForSkill(skillId);
      setTagStats(data);
    } catch (err) {
      console.error("Failed to fetch tag stats:", err);
      setError("Failed to load tag statistics");
    } finally {
      setIsLoading(false);
    }
  }, [skillId]);

  const refreshTagStats = useCallback(async () => {
    await fetchTagStats();
  }, [fetchTagStats]);

  useEffect(() => {
    let isMounted = true;

    const loadTagStats = async () => {
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
        const data = await getTagStatsForSkill(skillId);
        if (isMounted) {
          setTagStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch tag stats:", err);
        if (isMounted) {
          setError("Failed to load tag statistics");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTagStats();

    return () => {
      isMounted = false;
    };
  }, [skillId]);

  return {
    tagStats,
    isLoading,
    error,
    refreshTagStats,
  };
}
