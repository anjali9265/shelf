"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { BookWithStats, BookStatus, BookSearchResult } from "@/types";
import { useBookSearch } from "./useBookSearch";
import { SearchDropdown } from "./SearchDropdown";
import styles from "./AddBookModal.module.css";

type Props = {
  onAdd: (book: BookWithStats) => void;
  onClose: () => void;
};

export function AddBookModal({ onAdd, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<BookSearchResult | null>(null);
  const [status, setStatus] = useState<BookStatus>("WANT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const {
    results,
    loading: searching,
    error: searchError,
  } = useBookSearch(
    selected ? "" : query, // stop searching once a book is selected
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleSelect(book: BookSearchResult) {
    setSelected(book);
    setQuery(book.title);
    setShowDrop(false);
    setError("");
  }

  function handleClear() {
    setSelected(null);
    setQuery("");
    setError("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selected && query.trim().length < 2) {
      setError("Search for a book and select it from the list");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = selected
        ? {
            title: selected.title,
            author: selected.author,
            status,
            googleId: selected.googleId,
            cover: selected.cover ?? undefined,
            description: selected.description ?? undefined,
            genres: selected.genres,
            pageCount: selected.pageCount ?? undefined,
            publishedAt: selected.publishedAt ?? undefined,
          }
        : { title: query.trim(), author: "Unknown", status };

      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const canSubmit = selected || query.trim().length >= 2;

  return (
    <div
      className={styles.overlay}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Add a book"
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add a book</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Search input */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="search">
              Search
            </label>
            <div className={styles.searchWrap} ref={wrapRef}>
              <input
                id="search"
                ref={inputRef}
                className={styles.input}
                placeholder="Title, author, ISBN…"
                value={query}
                autoComplete="off"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(null);
                  setShowDrop(true);
                }}
                onFocus={() => setShowDrop(true)}
              />
              {query && (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={handleClear}
                  aria-label="Clear"
                >
                  ✕
                </button>
              )}
              {showDrop && (
                <SearchDropdown
                  results={results}
                  loading={searching}
                  error={searchError}
                  query={selected ? "" : query}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </div>

          {/* Selected book preview */}
          {selected && (
            <div className={styles.preview}>
              {selected.cover && (
                <div className={styles.previewCover}>
                  <Image
                    src={selected.cover}
                    alt={selected.title}
                    fill
                    sizes="56px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.previewInfo}>
                <p className={styles.previewTitle}>{selected.title}</p>
                <p className={styles.previewAuthor}>{selected.author}</p>
                {selected.publishedAt && (
                  <p className={styles.previewMeta}>
                    {selected.publishedAt.slice(0, 4)}
                  </p>
                )}
                {selected.pageCount && (
                  <p className={styles.previewMeta}>
                    {selected.pageCount} pages
                  </p>
                )}
                {selected.genres[0] && (
                  <span className={styles.previewGenre}>
                    {selected.genres[0]}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Status picker */}
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
                  {s === "WANT"
                    ? "Want to read"
                    : s === "READING"
                      ? "Reading"
                      : "Finished"}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || !canSubmit}
            >
              {loading ? "Adding…" : "Add to shelf"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
