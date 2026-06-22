import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const userId = session.user.id;

  const [books, sessions] = await Promise.all([
    prisma.book.findMany({
      where: { userId },
      select: { status: true, genres: true, finishedAt: true },
    }),
    prisma.readingSession.findMany({
      where: { userId },
      select: { duration: true, date: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalBooks     = books.length;
  const totalFinished  = books.filter((b) => b.status === "FINISHED").length;
  const totalReading   = books.filter((b) => b.status === "READING").length;
  const totalReadingTime = sessions.reduce((s, r) => s + r.duration, 0); // seconds

  // ── Genre breakdown ───────────────────────────────────────────────────────
  const genreMap: Record<string, number> = {};
  for (const book of books) {
    for (const g of book.genres) {
      const genre = g.trim();
      if (genre) genreMap[genre] = (genreMap[genre] ?? 0) + 1;
    }
  }
  const genres = Object.entries(genreMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // top 6 genres

  // ── Books finished per month (last 12 months) ─────────────────────────────
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

  // ── Reading time per week (last 8 weeks) ──────────────────────────────────
  const weeklyMap: Record<string, number> = {};
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    const key = `W${getWeekNumber(d)}`;
    weeklyMap[key] = 0;
  }
  for (const s of sessions) {
    const key = `W${getWeekNumber(new Date(s.date))}`;
    if (key in weeklyMap) weeklyMap[key] = (weeklyMap[key] ?? 0) + Math.round(s.duration / 60);
  }
  const weekly = Object.entries(weeklyMap).map(([week, minutes]) => ({ week, minutes }));

  // ── Streak ────────────────────────────────────────────────────────────────
  const sessionDays = new Set(
    sessions.map((s) => new Date(s.date).toISOString().slice(0, 10))
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (sessionDays.has(key)) streak++;
    else if (i > 0) break; // allow today to be missing (might not have read yet)
  }

  return NextResponse.json({
    totalBooks,
    totalFinished,
    totalReading,
    totalReadingTime,
    streak,
    genres,
    monthly,
    weekly,
  });
}

function getWeekNumber(d: Date) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
