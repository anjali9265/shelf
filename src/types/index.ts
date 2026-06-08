// src/types/index.ts
import { Book, BookStatus, ReadingSession } from "@prisma/client";

export type { Book, BookStatus, ReadingSession };

// What the API returns for a book card
export type BookWithStats = Book & {
  totalReadingTime: number; // seconds
  sessionCount: number;
};

// Shape of the POST /api/books body
export type CreateBookInput = {
  title: string;
  author: string;
  status?: BookStatus;
  googleId?: string;
  cover?: string;
  description?: string;
  genres?: string[];
  pageCount?: number;
  publishedAt?: string;
};

// Shape of the PATCH /api/books/[id] body
export type UpdateBookInput = Partial<CreateBookInput> & {
  status?: BookStatus;
};

// ─── Google Books search result (from our /api/books/search endpoint) ─────────
export type BookSearchResult = {
  googleId: string;
  title: string;
  author: string;
  cover: string | null;
  description: string | null;
  genres: string[];
  pageCount: number | null;
  publishedAt: string | null;
};


// ─── Raw Google Books API shapes (used in the route handler) ──────────────────
export type GoogleBookVolume = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    pageCount?: number;
    publishedDate?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
};

export type GoogleBooksSearchResult = {
  items?: GoogleBookVolume[];
  totalItems?: number;
};

// Extend next-auth Session type to include user.id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
