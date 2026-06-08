// Proxies Google Books API — key never exposed to the client
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { GoogleBookVolume, GoogleBooksSearchResult } from "@/types";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ items: [] });

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const url = new URL("https://www.googleapis.com/books/v1/volumes");
  url.searchParams.set("q", q);
  url.searchParams.set("maxResults", "8");
  url.searchParams.set("printType", "books");
  url.searchParams.set("langRestrict", "en");
  if (apiKey) url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);

    const data: GoogleBooksSearchResult = await res.json();

    // Shape the response into what the frontend needs
    const items = (data.items ?? []).map((vol: GoogleBookVolume) => {
      const info = vol.volumeInfo;
      // Google returns http covers — upgrade to https and larger size
      const rawCover = info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
      const cover = rawCover
        ? rawCover.replace("http://", "https://").replace("&zoom=1", "&zoom=2")
        : null;

      return {
        googleId:    vol.id,
        title:       info.title ?? "Untitled",
        author:      (info.authors ?? []).join(", ") || "Unknown author",
        cover,
        description: info.description ?? null,
        genres:      info.categories ?? [],
        pageCount:   info.pageCount ?? null,
        publishedAt: info.publishedDate ?? null,
      };
    });

    return NextResponse.json({ items });
  } catch (err) {
    console.error("[books/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 502 });
  }
}
