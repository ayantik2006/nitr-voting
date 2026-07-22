"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { authedFetch } from "@/lib/api-client";
import type { ActivityDoc, ElectionWithStats, Profile } from "@/lib/types";

export function useDashboardData(user: User | null) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [elections, setElections] = useState<ElectionWithStats[]>([]);
  const [activity, setActivity] = useState<ActivityDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const [profileRes, electionsRes, activityRes] = await Promise.all([
        authedFetch("/api/profile"),
        authedFetch("/api/elections"),
        authedFetch("/api/activity"),
      ]);
      setProfile(profileRes);
      setElections(electionsRes);
      setActivity(activityRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { profile, elections, activity, loading, error, refetch };
}
