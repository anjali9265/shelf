"use client";
import { useState, useEffect, useRef } from "react";
import { BookSearchResult } from "@/types";

type State = {
  results: BookSearchResult[];
  loading: boolean;
  error: string | null;
};

export function useBookSearch(query: string, delay = 320) {
  const [state, setState] = useState<State>({ results: [], loading: false, error: null });
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2) {
      setState({ results: [], loading: false, error: null });
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    const timer = setTimeout(async () => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch(
          `/api/books/search?q=${encodeURIComponent(q)}`,
          { signal: abortRef.current.signal }
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setState({ results: data.items ?? [], loading: false, error: null });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") return;
        setState({ results: [], loading: false, error: "Search failed — try again" });
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, delay]);

  return state;
}
