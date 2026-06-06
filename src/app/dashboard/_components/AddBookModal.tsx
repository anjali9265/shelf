"use client";
// src/app/dashboard/_components/AddBookModal.tsx
import { useState, useRef, useEffect } from "react";
import { BookWithStats, BookStatus } from "@/types";
import styles from "./AddBookModal.module.css";

type Props = {
  onAdd: (book: BookWithStats) => void;
  onClose: () => void;
};

export function AddBookModal({ onAdd, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState<BookStatus>("WANT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError("Title and author are required");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), author: author.trim(), status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }
      const book = await res.json();
      onAdd({ ...book, totalReadingTime: 0, sessionCount: 0 });
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Add a book">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add a book</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="title">Title</label>
            <input
              id="title"
              ref={inputRef}
              className={styles.input}
              placeholder="e.g. Sapiens"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="author">Author</label>
            <input
              id="author"
              className={styles.input}
              placeholder="e.g. Yuval Noah Harari"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <div className={styles.statusGroup}>
              {(["WANT", "READING", "FINISHED"] as BookStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`${styles.statusBtn} ${status === s ? styles.active : ""}`}
                  data-status={s}
                  onClick={() => setStatus(s)}
                >
                  {s === "WANT" ? "Want to read" : s === "READING" ? "Reading" : "Finished"}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Adding…" : "Add to shelf"}
            </button>
          </div>
        </form>

        <p className={styles.hint}>
          Google Books search coming in Phase 2 — auto-fill covers and metadata.
        </p>
      </div>
    </div>
  );
}
