"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { INSTRUMENTS, STARTING_CASH, stepPrice } from "./market";

const HISTORY_LENGTH = 48;
const TICK_MS = 1600;

const MarketContext = createContext(null);

function initialQuotes() {
  const quotes = {};
  for (const { symbol, basePrice } of INSTRUMENTS) {
    quotes[symbol] = {
      price: basePrice,
      prevPrice: basePrice,
      openPrice: basePrice,
      history: Array(HISTORY_LENGTH).fill(basePrice),
    };
  }
  return quotes;
}

export function MarketProvider({ children }) {
  // Quotes start pinned to basePrice so server-rendered markup and the first
  // client render match exactly — randomness only begins after mount, inside
  // the interval below, which sidesteps hydration mismatches entirely.
  const [quotes, setQuotes] = useState(initialQuotes);
  const [cash, setCash] = useState(STARTING_CASH);
  const [positions, setPositions] = useState({}); // symbol -> { qty, avgCost }
  const [trades, setTrades] = useState([]);
  const [marketMood, setMarketMood] = useState(0); // -1..1, smoothed, drives 3D scene tint

  // Mirrors `quotes` for synchronous reads inside executeTrade, so a trade
  // always prices against the latest tick without depending on (and thus
  // re-creating the callback on) every single price update.
  const quotesRef = useRef(quotes);
  useEffect(() => {
    quotesRef.current = quotes;
  }, [quotes]);
  const positionsRef = useRef(positions);
  useEffect(() => {
    positionsRef.current = positions;
  }, [positions]);
  const cashRef = useRef(cash);
  useEffect(() => {
    cashRef.current = cash;
  }, [cash]);

  useEffect(() => {
    let cancelled = false;
    const id = setInterval(() => {
      if (cancelled) return;
      const drift = (Math.random() - 0.48) * 0.06; // faint upward bias, like a real tape
      setMarketMood((m) => m * 0.85 + drift * 6);
      setQuotes((prev) => {
        const next = {};
        for (const { symbol } of INSTRUMENTS) {
          const q = prev[symbol];
          const price = stepPrice(q.price, { marketDrift: drift, volatility: 0.4 });
          next[symbol] = {
            price,
            prevPrice: q.price,
            openPrice: q.openPrice,
            history: [...q.history.slice(1), price],
          };
        }
        return next;
      });
    }, TICK_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const executeTrade = useCallback(({ symbol, side, qty }) => {
    const price = quotesRef.current[symbol]?.price;
    if (!price || qty <= 0) return { ok: false, reason: "No live price for that symbol." };

    const existing = positionsRef.current[symbol] ?? { qty: 0, avgCost: 0 };

    if (side === "sell" && existing.qty <= 0) {
      return { ok: false, reason: `You don't hold any ${symbol} to sell.` };
    }

    const cost = price * qty;

    if (side === "buy") {
      if (cost > cashRef.current) {
        return { ok: false, reason: "Not enough buying power for that order." };
      }
      setCash((c) => c - cost);
      const newQty = existing.qty + qty;
      const newAvgCost = (existing.avgCost * existing.qty + cost) / newQty;
      setPositions((prev) => ({ ...prev, [symbol]: { qty: newQty, avgCost: newAvgCost } }));
      setTrades((t) => [{ id: crypto.randomUUID(), symbol, side, qty, price, at: Date.now() }, ...t].slice(0, 30));
      return { ok: true };
    }

    // sell — clamp to what's actually held (no naked shorting in v1)
    const sellQty = Math.min(qty, existing.qty);
    setCash((c) => c + price * sellQty);
    setTrades((t) => [{ id: crypto.randomUUID(), symbol, side, qty: sellQty, price, at: Date.now() }, ...t].slice(0, 30));
    setPositions((prev) => {
      const remainingQty = existing.qty - sellQty;
      if (remainingQty <= 0) {
        const { [symbol]: _drop, ...rest } = prev;
        return rest;
      }
      return { ...prev, [symbol]: { qty: remainingQty, avgCost: existing.avgCost } };
    });
    return { ok: true, qty: sellQty };
  }, []);

  const holdingsValue = useMemo(
    () =>
      Object.entries(positions).reduce((sum, [symbol, pos]) => {
        const price = quotes[symbol]?.price ?? 0;
        return sum + price * pos.qty;
      }, 0),
    [positions, quotes]
  );

  const equity = cash + holdingsValue;

  const [equityHistory, setEquityHistory] = useState(() => [STARTING_CASH]);
  useEffect(() => {
    // `equity` is a derived number recomputed every render, not a discrete
    // event — an effect is the only place that can turn "its value changed"
    // into "append to a persisted rolling window" without recomputing the
    // whole history from scratch on every tick.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEquityHistory((h) => [...h.slice(-59), equity]);
  }, [equity]);

  /**
   * Wipes the practice account back to a fresh $100,000 start — cash,
   * positions, fill history, and the equity sparkline all reset together so
   * nothing stale (a leftover position, an old equity point) survives a
   * reset. Purely local state, so this is free and instant; nothing server-
   * side to call.
   */
  const resetAccount = useCallback(() => {
    setCash(STARTING_CASH);
    setPositions({});
    setTrades([]);
    setEquityHistory([STARTING_CASH]);
  }, []);

  const value = useMemo(
    () => ({
      instruments: INSTRUMENTS,
      quotes,
      cash,
      positions,
      trades,
      holdingsValue,
      equity,
      equityHistory,
      marketMood,
      executeTrade,
      resetAccount,
    }),
    [quotes, cash, positions, trades, holdingsValue, equity, equityHistory, marketMood, executeTrade, resetAccount]
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarket must be used within a MarketProvider");
  return ctx;
}

/** Ref-based scroll + pointer progress, read directly inside R3F's useFrame
 * loop rather than through React state — keeps 60fps scene updates from
 * triggering component re-renders. */
export function useLiveInputRef() {
  const ref = useRef({ scrollProgress: 0, pointer: { x: 0, y: 0 } });

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      ref.current.scrollProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const onPointerMove = (e) => {
      ref.current.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      ref.current.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return ref;
}
