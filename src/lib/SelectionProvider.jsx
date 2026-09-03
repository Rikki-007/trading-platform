"use client";

import { createContext, useContext, useMemo, useState } from "react";

const SelectionContext = createContext(null);

/**
 * The one piece of state that used to live as local `useState` on the old
 * single-page layout (`selectedSymbol`) and got passed straight down to
 * Watchlist/PriceChart/OrderBook/TradeExecution as props. Now that Markets
 * and Trade are separate routes, a page-local `useState` wouldn't survive
 * navigating between them — this context is the minimal fix: same value,
 * same shape, just reachable from any page instead of one.
 */
export function SelectionProvider({ children }) {
  const [selectedSymbol, setSelectedSymbol] = useState("GRDV");

  const value = useMemo(() => ({ selectedSymbol, setSelectedSymbol }), [selectedSymbol]);

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error("useSelection must be used within a SelectionProvider");
  return ctx;
}
