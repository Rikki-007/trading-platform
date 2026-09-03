"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Compass } from "lucide-react";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency } from "@/lib/market";

function timeAgo(ts) {
  const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function ActivityLog() {
  const { trades } = useMarket();

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hairline-strong bg-navy/30 py-14 text-center">
        <Compass className="h-6 w-6 text-mist-dim" strokeWidth={1.5} />
        <p className="max-w-xs text-sm text-mist">
          No orders yet. Fills you make in the Trade panel above will show up here as they happen.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-navy/50 backdrop-blur-md">
      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 border-b border-hairline px-5 py-3 text-[11px] uppercase tracking-wider text-mist-dim">
        <span>Side</span>
        <span>Symbol</span>
        <span className="text-right">Fill</span>
        <span className="text-right">When</span>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <AnimatePresence initial={false}>
          {trades.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 border-b border-hairline/60 px-5 py-2.5 text-sm last:border-b-0"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  t.side === "buy" ? "bg-cyan/10 text-cyan" : "bg-crimson/10 text-crimson"
                }`}
              >
                {t.side === "buy" ? (
                  <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={2} />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
                )}
              </span>
              <span className="font-mono text-porcelain">
                {t.qty} <span className="text-mist-dim">{t.symbol}</span>
              </span>
              <span className="text-right font-mono font-variant-tabular text-porcelain">
                {formatCurrency(t.price)}
              </span>
              <span className="text-right text-xs text-mist-dim">{timeAgo(t.at)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
