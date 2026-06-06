"use client";
// src/app/dashboard/_components/Charts.tsx
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { DashboardStats } from "@/types/stats";
import styles from "./Charts.module.css";

const GENRE_COLORS = ["#D4834A", "#4A90A4", "#5A8F6A", "#9B6B9B", "#C4A44A", "#7A6B8A"];

type Props = { stats: DashboardStats };

export function Charts({ stats }: Props) {
  const hasGenres  = stats.genres.length > 0;
  const hasMonthly = stats.monthly.some((m) => m.count > 0);

  return (
    <div className={styles.grid}>
      {/* Genre breakdown */}
      <div className={styles.chart}>
        <p className={styles.chartTitle}>Genres</p>
        {hasGenres ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.genres}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {stats.genres.map((_, i) => (
                    <Cell key={i} fill={GENRE_COLORS[i % GENRE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${(v as number) ?? 0} book${((v as number) ?? 0) !== 1 ? "s" : ""}`, ""]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              {stats.genres.map((g, i) => (
                <div key={g.name} className={styles.legendItem}>
                  <span className={styles.dot} style={{ background: GENRE_COLORS[i % GENRE_COLORS.length] }} />
                  <span className={styles.legendLabel}>{g.name}</span>
                  <span className={styles.legendVal}>{g.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>Finish some books to see your genres</div>
        )}
      </div>

      {/* Books finished per month */}
      <div className={styles.chart}>
        <p className={styles.chartTitle}>Books finished</p>
        {hasMonthly ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.monthly} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={24} />
              <Tooltip
                formatter={(v) => [`${(v as number) ?? 0} book${((v as number) ?? 0) !== 1 ? "s" : ""}`, ""]}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
                cursor={{ fill: "var(--bg-subtle)" }}
              />
              <Bar dataKey="count" fill="var(--finished)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className={styles.empty}>Mark books as finished to see your progress</div>
        )}
      </div>

      {/* Reading time per week */}
      <div className={styles.chart}>
        <p className={styles.chartTitle}>Reading time <span className={styles.unit}>(mins / week)</span></p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={stats.weekly} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} width={30} />
            <Tooltip
              formatter={(v) => [`${(v as number) ?? 0} min${((v as number) ?? 0) !== 1 ? "s" : ""}`, ""]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid var(--border)" }}
              cursor={{ fill: "var(--bg-subtle)" }}
            />
            <Bar dataKey="minutes" fill="var(--reading)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
