// src/app/api/books/[id]/route.ts
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateBookInput } from "@/types";

// PATCH /api/books/[id] — update status or metadata
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (book.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body: UpdateBookInput = await req.json();

  // Auto-set timestamps when status changes
  const statusTimestamps: Record<string, object> = {};
  if (body.status === "READING" && book.status !== "READING") {
    statusTimestamps.startedAt = new Date();
  }
  if (body.status === "FINISHED" && book.status !== "FINISHED") {
    statusTimestamps.finishedAt = new Date();
  }

  const updated = await prisma.book.update({
    where: { id: params.id },
    data: {
      ...body,
      ...statusTimestamps,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/books/[id] — remove a book (cascades sessions)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const book = await prisma.book.findUnique({ where: { id: params.id } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (book.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.book.delete({ where: { id: params.id } });

  return new NextResponse(null, { status: 204 });
}
