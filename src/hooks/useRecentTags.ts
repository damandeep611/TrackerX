"use client";

import { useState, useEffect } from "react";
import { getUniqueTagsForSkill } from "@/actions/skillAnalyticsAction";

interface UseRecentTagsReturn {
  recentTags: string[];
  isLoading: boolean;
  error: string | null;
}

export function useRecentTags(skillId: string): UseRecentTagsReturn {
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
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
        const data = await getUniqueTagsForSkill(skillId);
        if (isMounted) {
          setRecentTags(data);
        }
      } catch (err) {
        console.error("Failed to fetch recent tags:", err);
        if (isMounted) {
          setError("Failed to load tag suggestions");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTags();

    return () => {
      isMounted = false;
    };
  }, [skillId]);

  return {
    recentTags,
    isLoading,
    error,
  };
}
