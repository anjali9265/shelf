import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "./_components/KanbanBoard";
import { StatCards } from "./_components/StatCards";
import { Charts } from "./_components/Charts";
import { ReadingTimer } from "./_components/ReadingTimer";
import { Recommendations } from "./_components/Recommendations";
import { Navbar } from "../_components/Navbar";
import { DashboardStats } from "@/types/stats";
import styles from "./dashboard.module.css";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  const [books, sessions] = await Promise.all([
    prisma.book.findMany({
      where: { userId },
      include: { readingSessions: { select: { duration: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.readingSession.findMany({
      where: { userId },
      select: { duration: true, date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const booksWithStats = books.map(({ readingSessions, ...book }) => ({
    ...book,
    totalReadingTime: readingSessions.reduce((s, r) => s + r.duration, 0),
    sessionCount: readingSessions.length,
  }));

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalBooks = books.length;
  const totalFinished = books.filter((b) => b.status === "FINISHED").length;
  const totalReading = books.filter((b) => b.status === "READING").length;
  const totalReadingTime = sessions.reduce((s, r) => s + r.duration, 0);

  const genreMap: Record<string, number> = {};
  for (const b of books) {
    for (const g of b.genres) {
      const genre = g.trim();
      if (genre) genreMap[genre] = (genreMap[genre] ?? 0) + 1;
    }
  }
  const genres = Object.entries(genreMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const now = new Date();
  const monthlyMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = 0;
  }
  for (const book of books) {
    if (book.status === "FINISHED" && book.finishedAt) {
      const d = book.finishedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in monthlyMap) monthlyMap[key]++;
    }
  }
  const monthly = Object.entries(monthlyMap).map(([month, count]) => ({
    month: new Date(month + "-01").toLocaleDateString("en", { month: "short" }),
    count,
  }));

  const weeklyMap: Record<string, number> = {};
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const key = `W${getWeek(d)}`;
    weeklyMap[key] = 0;
  }
  for (const s of sessions) {
    const key = `W${getWeek(new Date(s.date))}`;
    if (key in weeklyMap)
      weeklyMap[key] = (weeklyMap[key] ?? 0) + Math.round(s.duration / 60);
  }
  const weekly = Object.entries(weeklyMap).map(([week, minutes]) => ({
    week,
    minutes,
  }));

  const sessionDays = new Set(
    sessions.map((s) => new Date(s.date).toISOString().slice(0, 10)),
  );
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (sessionDays.has(d.toISOString().slice(0, 10))) streak++;
    else if (i > 0) break;
  }

  const stats: DashboardStats = {
    totalBooks,
    totalFinished,
    totalReading,
    totalReadingTime,
    streak,
    genres,
    monthly,
    weekly,
  };

  return (
    <div className={styles.page}>
      <Navbar user={session.user} />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Your shelf</h1>
          <p className={styles.sub}>
            {totalBooks} book{totalBooks !== 1 ? "s" : ""} tracked
          </p>
        </div>

        <StatCards stats={stats} />
        <Charts stats={stats} />

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Reading session</p>
          <ReadingTimer books={booksWithStats} />
        </div>

        <Recommendations />

        <div className={styles.section}>
          <p className={styles.sectionLabel}>Your books</p>
          <KanbanBoard initialBooks={booksWithStats} />
        </div>
      </main>
    </div>
  );
}

function getWeek(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
