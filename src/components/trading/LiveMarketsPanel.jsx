"use client";

import { motion } from "framer-motion";
import { Radio, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useLiveQuotes } from "@/lib/market/useLiveQuotes";
import { LIVE_INSTRUMENTS } from "@/lib/market/liveInstruments";
import { formatSigned } from "@/lib/market";

/**
 * Real-market-data panel — separate from the practice-tier Watchlist, which
 * intentionally stays on its fictional, simulated instruments. This panel
 * shows real symbols (see src/lib/market/liveInstruments.js) via Polygon.io,
 * and is explicit about being unconnected when POLYGON_API_KEY isn't set
 * rather than silently showing nothing.
 */
export default function LiveMarketsPanel() {
  const { configured, quotes, error, loading } = useLiveQuotes();

  return (
    <div className="rounded-2xl border border-hairline bg-navy/50 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
          <span className="text-xs uppercase tracking-wider text-mist">Live market data</span>
        </div>
        {configured && (
          <span className="flex items-center gap-1.5 text-[11px] text-mist-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-slow" />
            Polygon.io
          </span>
        )}
      </div>

      {configured === false && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-hairline bg-void-deep/40 p-3 text-xs text-mist">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.75} />
          <span>
            Not connected — set <code className="text-porcelain">POLYGON_API_KEY</code> to show real
            stock, crypto, and forex prices here.
          </span>
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs text-crimson">{error}</p>
      )}

      {configured && (
        <div className="mt-3 space-y-1">
          {LIVE_INSTRUMENTS.map(({ symbol, name }) => {
            const quote = quotes.find((q) => q.symbol === symbol);
            const isUp = (quote?.changePct ?? 0) >= 0;
            return (
              <motion.div
                key={symbol}
                layout
                className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-navy-light/40"
              >
                <div>
                  <div className="font-mono text-porcelain">{symbol.replace(/^[A-Z]:/, "")}</div>
                  <div className="text-[11px] text-mist-dim">{name}</div>
                </div>
                {quote && !quote.error ? (
                  <div className="text-right">
                    <div className="font-mono font-variant-tabular text-porcelain">
                      {quote.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </div>
                    <div className={`flex items-center justify-end gap-1 text-xs ${isUp ? "text-cyan" : "text-crimson"}`}>
                      {isUp ? <TrendingUp className="h-3 w-3" strokeWidth={2} /> : <TrendingDown className="h-3 w-3" strokeWidth={2} />}
                      {formatSigned(quote.changePct, { suffix: "%" })}
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-mist-dim">{loading ? "loading…" : "unavailable"}</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
