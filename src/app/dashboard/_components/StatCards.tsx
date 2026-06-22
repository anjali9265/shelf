"use client";
import { DashboardStats } from "@/types/stats";
import styles from "./StatCards.module.css";

type Props = { stats: DashboardStats };

function formatTime(secs: number) {
  if (secs === 0) return "0s";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h === 0 && m === 0) return `${s}s`;
  if (h === 0) return `${m}m ${s}s`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

const CARDS = (s: DashboardStats) => [
  {
    label: "Books on shelf",
    value: s.totalBooks,
    sub: `${s.totalReading} reading now`,
  },
  { label: "Finished", value: s.totalFinished, sub: "all time" },
  {
    label: "Time read",
    value: formatTime(s.totalReadingTime),
    sub: "tracked sessions",
  },
  {
    label: "Day streak",
    value: s.streak,
    sub: s.streak === 1 ? "day" : "days",
  },
];

export function StatCards({ stats }: Props) {
  return (
    <div className={styles.grid}>
      {CARDS(stats).map((card) => (
        <div key={card.label} className={styles.card}>
          <p className={styles.label}>{card.label}</p>
          <p className={styles.value}>{card.value}</p>
          <p className={styles.sub}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
