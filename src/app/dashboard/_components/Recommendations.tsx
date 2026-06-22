"use client";
import { useState } from "react";
import axios from "axios";
import styles from "./Recommendations.module.css";

type Rec = { title: string; author: string; reason: string };

export function Recommendations() {
  const [recs, setRecs]       = useState<Rec[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [loaded, setLoaded]   = useState(false);

  async function fetchRecs() {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("/api/ai/recommendations");
      const data = res.data;
      if (data.error) throw new Error(data.error);
      if (data.message) { setError(data.message); return; }
      setRecs(data.recommendations ?? []);
      setLoaded(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>What to read next</p>
          <p className={styles.sub}>Personalised picks based on your reading history</p>
        </div>
        <button
          className={styles.btn}
          onClick={fetchRecs}
          disabled={loading}
        >
          {loading ? "Thinking…" : loaded ? "Refresh ✦" : "Suggest books ✦"}
        </button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {recs.length > 0 && (
        <div className={styles.recs}>
          {recs.map((rec, i) => (
            <div key={i} className={styles.rec}>
              <div className={styles.recNum}>{i + 1}</div>
              <div className={styles.recInfo}>
                <p className={styles.recTitle}>{rec.title}</p>
                <p className={styles.recAuthor}>{rec.author}</p>
                <p className={styles.recReason}>{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loaded && !loading && recs.length === 0 && !error && (
        <p className={styles.hint}>
          Finish a few books and Gemini will suggest your next read based on your taste.
        </p>
      )}
    </div>
  );
}
