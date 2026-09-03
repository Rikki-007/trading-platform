"use client";

import { useEffect, useState } from "react";

/**
 * Polls /api/market/quotes on an interval. Starts empty/unconfigured on
 * both server and client render (no fetch happens until after mount), so
 * this never causes a hydration mismatch — same discipline as
 * MarketProvider's own random-value handling.
 */
export function useLiveQuotes({ intervalMs = 8000 } = {}) {
  const [state, setState] = useState({ configured: null, quotes: [], error: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    async function fetchQuotes() {
      try {
        const res = await fetch("/api/market/quotes", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          setState({
            configured: data.configured,
            quotes: data.quotes || [],
            error: data.error || null,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setState((s) => ({ ...s, error: "Couldn't reach the market data service.", loading: false }));
        }
      }
    }

    fetchQuotes();
    const id = setInterval(fetchQuotes, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return state;
}
