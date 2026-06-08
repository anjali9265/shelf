"use client";
import Image from "next/image";
import { BookSearchResult } from "@/types";
import styles from "./SearchDropdown.module.css";

type Props = {
  results: BookSearchResult[];
  loading: boolean;
  error: string | null;
  query: string;
  onSelect: (book: BookSearchResult) => void;
};

export function SearchDropdown({ results, loading, error, query, onSelect }: Props) {
  if (query.trim().length < 2) return null;

  return (
    <div className={styles.dropdown} role="listbox" aria-label="Search results">
      {loading && (
        <div className={styles.state}>
          <span className={styles.spinner} aria-hidden="true" />
          Searching…
        </div>
      )}

      {error && !loading && (
        <div className={styles.state}>{error}</div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className={styles.state}>No results for &ldquo;{query}&rdquo;</div>
      )}

      {!loading && results.map((book) => (
        <button
          key={book.googleId}
          className={styles.result}
          role="option"
          onClick={() => onSelect(book)}
        >
          <div className={styles.cover}>
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                sizes="40px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span className={styles.coverFallback}>{book.title[0]}</span>
            )}
          </div>
          <div className={styles.meta}>
            <span className={styles.title}>{book.title}</span>
            <span className={styles.author}>{book.author}</span>
            {book.publishedAt && (
              <span className={styles.year}>{book.publishedAt.slice(0, 4)}</span>
            )}
          </div>
          {book.genres[0] && (
            <span className={styles.genre}>{book.genres[0]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
