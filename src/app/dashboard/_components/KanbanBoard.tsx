"use client";
// src/app/dashboard/_components/KanbanBoard.tsx
import { useState, useTransition } from "react";
import { BookWithStats, BookStatus } from "@/types";
import { BookCard } from "./BookCard";
import { AddBookModal } from "./AddBookModal";
import styles from "./KanbanBoard.module.css";

const COLUMNS: { status: BookStatus; label: string; accent: string }[] = [
  { status: "READING",  label: "Reading",       accent: "var(--reading)"  },
  { status: "WANT",     label: "Want to read",  accent: "var(--want)"     },
  { status: "FINISHED", label: "Finished",      accent: "var(--finished)" },
];

type Props = { initialBooks: BookWithStats[] };

export function KanbanBoard({ initialBooks }: Props) {
  const [books, setBooks] = useState<BookWithStats[]>(initialBooks);
  const [showModal, setShowModal] = useState(false);
  const [, startTransition] = useTransition();

  const byStatus = (status: BookStatus) => books.filter((b) => b.status === status);

  async function handleAdd(book: BookWithStats) {
    setBooks((prev) => [book, ...prev]);
    setShowModal(false);
  }

  async function handleStatusChange(id: string, status: BookStatus) {
    // Optimistic update
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));

    startTransition(async () => {
      await fetch(`/api/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    });
  }

  async function handleDelete(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/books/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          + Add book
        </button>
      </div>

      <div className={styles.columns}>
        {COLUMNS.map(({ status, label, accent }) => (
          <div key={status} className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.dot} style={{ background: accent }} />
              <span className={styles.columnLabel}>{label}</span>
              <span className={styles.count}>{byStatus(status).length}</span>
            </div>
            <div className={styles.cards}>
              {byStatus(status).length === 0 ? (
                <div className={styles.empty}>Nothing here yet</div>
              ) : (
                byStatus(status).map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddBookModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
