"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { DashboardStats } from "@/types/stats";
import { StatCards } from "./StatCards";

type Props = { stats: DashboardStats };

export function StatCardsContainer({ stats: initialStats }: Props) {
  const [stats, setStats] = useState(initialStats);

  const refreshStats = useCallback(async () => {
    try {
      const res = await axios.get("/api/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to refresh stats:", error);
    }
  }, []);

  // Make refreshStats available globally for ReadingTimer
  useEffect(() => {
    (window as any).__refreshStats = refreshStats;
  }, [refreshStats]);

  return <StatCards stats={stats} />;
}
