
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const finishedBooks = await prisma.book.findMany({
    where: { userId: session.user.id, status: "FINISHED" },
    select: { title: true, author: true, genres: true, aiSummary: true },
    orderBy: { finishedAt: "desc" },
    take: 8,
  });

  if (finishedBooks.length === 0) {
    return NextResponse.json({
      recommendations: [],
      message: "Finish some books first and I'll suggest what to read next.",
    });
  }

  const bookList = finishedBooks
    .map((b) => `- "${b.title}" by ${b.author}${b.genres.length ? ` (${b.genres.slice(0, 2).join(", ")})` : ""}`)
    .join("\n");

  const prompt = `You are a knowledgeable book recommender. Based on this person's reading history, suggest 3 books they would genuinely enjoy next.

Books they've read:
${bookList}

For each recommendation, provide:
1. The book title and author
2. One sentence explaining why it matches their taste based on what they've read

Format your response as JSON only — no markdown, no extra text. Use this exact structure:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "reason": "One sentence why they'd enjoy it."
  }
]`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the JSON
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

    const recommendations = JSON.parse(text);
    return NextResponse.json({ recommendations });
  } catch (err) {
    console.error("[ai/recommendations]", err);
    return NextResponse.json({ error: "AI generation failed" }, { status: 502 });
  }
}
