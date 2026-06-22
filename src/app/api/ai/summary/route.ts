
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { bookId } = await req.json();
  if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book || book.userId !== session.user.id) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  // Return cached summary if it already exists
  if (book.aiSummary) {
    return NextResponse.json({ summary: book.aiSummary, cached: true });
  }

  const prompt = `You are a thoughtful book analyst. Given the following book details, write a concise summary of its key themes and ideas in exactly 3 bullet points. Each bullet should be one clear sentence. Be insightful, not just descriptive. Do not use markdown bold or headers — just plain bullet points starting with "•".

Book: "${book.title}"
Author: ${book.author}
${book.genres.length > 0 ? `Genres: ${book.genres.join(", ")}` : ""}
${book.description ? `Description: ${book.description.slice(0, 500)}` : ""}

Respond with exactly 3 bullet points and nothing else.`;

  try {
    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    // Cache it in the DB so we never call Gemini for this book again
    await prisma.book.update({
      where: { id: bookId },
      data: { aiSummary: summary },
    });

    return NextResponse.json({ summary, cached: false });
  } catch (err) {
    console.error("[ai/summary]", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }
}
