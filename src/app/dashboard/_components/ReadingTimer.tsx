"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BookWithStats } from "@/types";
import styles from "./ReadingTimer.module.css";

type Props = { books: BookWithStats[] };

export function ReadingTimer({ books }: Props) {
  const readingBooks = books.filter((b) => b.status === "READING");
  const [selectedId, setSelectedId] = useState(readingBooks[0]?.id ?? "");
  const [running, setRunning]       = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function fmt(secs: number) {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function handleStop() {
    setRunning(false);
    if (elapsed < 10 || !selectedId) { setElapsed(0); return; }

    setSaving(true);
    try {
      await axios.post("/api/sessions", { bookId: selectedId, duration: elapsed }, { headers: { "Content-Type": "application/json" } });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Refresh stats dynamically
      if ((window as any).__refreshStats) {
        await (window as any).__refreshStats();
      }
    } finally {
      setSaving(false);
      setElapsed(0);
    }
  }

  if (readingBooks.length === 0) {
    return (
      <div className={styles.empty}>
        Move a book to <em>Reading</em> to start a session
      </div>
    );
  }

  return (
    <div className={styles.timer}>
      <select
        className={styles.select}
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        disabled={running}
      >
        {readingBooks.map((b) => (
          <option key={b.id} value={b.id}>{b.title}</option>
        ))}
      </select>

      <div className={styles.display}>{fmt(elapsed)}</div>

      <div className={styles.controls}>
        {!running ? (
          <button className={styles.startBtn} onClick={() => setRunning(true)}>
            ▶ Start session
          </button>
        ) : (
          <button className={styles.stopBtn} onClick={handleStop}>
            ■ Stop &amp; save
          </button>
        )}
      </div>

      {saving && <p className={styles.status}>Saving…</p>}
      {saved  && <p className={styles.status}>Session saved ✓</p>}
    </div>
  );
}
