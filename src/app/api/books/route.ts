// src/app/api/books/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateBookInput } from "@/types";

// GET /api/books — returns all books for the logged-in user, grouped by status
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const books = await prisma.book.findMany({
    where: { userId: session.user.id },
    include: {
      readingSessions: {
        select: { duration: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Attach computed stats to each book
  const booksWithStats = books.map((book) => {
    const totalReadingTime = book.readingSessions.reduce((sum, s) => sum + s.duration, 0);
    const sessionCount = book.readingSessions.length;
    const { readingSessions, ...rest } = book;
    return { ...rest, totalReadingTime, sessionCount };
  });

  return NextResponse.json(booksWithStats);
}

// POST /api/books — add a new book
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body: CreateBookInput = await req.json();

  if (!body.title?.trim() || !body.author?.trim()) {
    return NextResponse.json({ error: "Title and author are required" }, { status: 400 });
  }

  // Prevent duplicate Google Books entries for the same user
  if (body.googleId) {
    const existing = await prisma.book.findFirst({
      where: { userId: session.user.id, googleId: body.googleId },
    });
    if (existing) {
      return NextResponse.json({ error: "You already have this book on your shelf" }, { status: 409 });
    }
  }

  const book = await prisma.book.create({
    data: {
      userId: session.user.id,
      title: body.title.trim(),
      author: body.author.trim(),
      status: body.status ?? "WANT",
      googleId: body.googleId,
      cover: body.cover,
      description: body.description,
      genres: body.genres ?? [],
      pageCount: body.pageCount,
      publishedAt: body.publishedAt,
      startedAt: body.status === "READING" ? new Date() : null,
      finishedAt: body.status === "FINISHED" ? new Date() : null,
    },
  });

  return NextResponse.json(book, { status: 201 });
}
