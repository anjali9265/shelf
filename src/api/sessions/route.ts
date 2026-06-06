// src/app/api/sessions/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/sessions — save a completed reading session
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { bookId, duration } = await req.json();

  if (!bookId || typeof duration !== "number" || duration < 10) {
    return NextResponse.json({ error: "bookId and duration (≥10s) required" }, { status: 400 });
  }

  // Verify the book belongs to this user
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.userId !== session.user.id) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const readingSession = await prisma.readingSession.create({
    data: {
      userId:   session.user.id,
      bookId,
      duration: Math.round(duration),
      date:     new Date(),
    },
  });

  return NextResponse.json(readingSession, { status: 201 });
}
