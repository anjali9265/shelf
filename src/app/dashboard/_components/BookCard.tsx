"use client";
// src/app/dashboard/_components/BookCard.tsx
import { useState } from "react";
import Image from "next/image";
import { BookWithStats, BookStatus } from "@/types";
import styles from "./BookCard.module.css";

const STATUS_LABELS: Record<BookStatus, string> = {
  READING: "Reading",
  WANT: "Want to read",
  FINISHED: "Finished",
};

const OTHER_STATUSES = (current: BookStatus): BookStatus[] =>
  (["READING", "WANT", "FINISHED"] as BookStatus[]).filter((s) => s !== current);

type Props = {
  book: BookWithStats;
  onStatusChange: (id: string, status: BookStatus) => void;
  onDelete: (id: string) => void;
};

export function BookCard({ book, onStatusChange, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const formatTime = (secs: number) => {
    if (secs < 60) return `${secs}s`;
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.inner}>
        {book.cover ? (
          <div className={styles.cover}>
            <Image src={book.cover} alt={book.title} fill sizes="56px" style={{ objectFit: "cover" }} />
          </div>
        ) : (
          <div className={styles.coverPlaceholder}>
            <span>{book.title[0]}</span>
          </div>
        )}
        <div className={styles.info}>
          <p className={styles.title}>{book.title}</p>
          <p className={styles.author}>{book.author}</p>
          {book.genres.length > 0 && (
            <p className={styles.genre}>{book.genres[0]}</p>
          )}
          {book.totalReadingTime > 0 && (
            <p className={styles.time}>{formatTime(book.totalReadingTime)} read</p>
          )}
        </div>
        <div className={styles.actions}>
          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Book options"
          >
            ···
          </button>
          {menuOpen && (
            <div className={styles.menu}>
              {OTHER_STATUSES(book.status).map((s) => (
                <button
                  key={s}
                  className={styles.menuItem}
                  onClick={() => { onStatusChange(book.id, s); setMenuOpen(false); }}
                >
                  Move to {STATUS_LABELS[s]}
                </button>
              ))}
              <button
                className={`${styles.menuItem} ${styles.danger}`}
                onClick={() => { onDelete(book.id); setMenuOpen(false); }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
