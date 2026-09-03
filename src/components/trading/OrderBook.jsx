"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMarket } from "@/lib/MarketProvider";
import { generateOrderBook, formatCurrency } from "@/lib/market";

function Row({ side, level, maxSize }) {
  const isBid = side === "bid";
  const widthPct = Math.max(6, (level.size / maxSize) * 100);

  return (
    <div className={`relative flex items-center gap-2 px-3 py-1 text-xs font-mono font-variant-tabular ${isBid ? "flex-row" : "flex-row-reverse"}`}>
      <motion.span
        className={`absolute inset-y-0.5 rounded-sm ${isBid ? "right-0 bg-cyan/10" : "left-0 bg-crimson/10"}`}
        initial={false}
        animate={{ width: `${widthPct}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <span className="relative z-10 w-16 text-mist-dim">{level.size}</span>
      <span className={`relative z-10 flex-1 ${isBid ? "text-right text-cyan" : "text-left text-crimson"}`}>
        {formatCurrency(level.price)}
      </span>
    </div>
  );
}

export default function OrderBook({ symbol }) {
  const { quotes } = useMarket();
  const quote = quotes[symbol];

  // The book is randomly generated, so it must never be computed during
  // render (that would run once on the server and again on the client,
  // producing different numbers and a hydration mismatch). Instead it starts
  // empty — identical on server and first client paint — and is filled in by
  // this effect only after mount, then regenerated each time the price ticks.
  const [book, setBook] = useState(null);
  useEffect(() => {
    // Deliberately setting state right away here, not just subscribing to
    // one: generateOrderBook() is random, and running it during render would
    // run once on the server and again on the client with different numbers
    // — a hydration mismatch. Deferring it into an effect is what keeps the
    // first client paint identical to the server's (both show the skeleton).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (quote) setBook(generateOrderBook(quote.price));
  }, [quote, symbol]);

  if (!quote) return null;

  return (
    <div className="rounded-2xl border border-hairline bg-navy/50 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-mist">Order book</span>
          <div className="font-mono text-sm text-porcelain">{symbol}</div>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-mist">Spread</span>
          <div className="font-mono text-sm font-variant-tabular text-gold">
            {book ? formatCurrency(book.spread) : "—"}
          </div>
        </div>
      </div>

      {book ? (
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 flex justify-between px-3 text-[10px] uppercase tracking-wider text-mist-dim">
              <span>Size</span>
              <span>Bid</span>
            </div>
            <div className="space-y-0.5">
              {book.bids.map((level, i) => (
                <Row key={i} side="bid" level={level} maxSize={book.maxSize} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between px-3 text-[10px] uppercase tracking-wider text-mist-dim">
              <span>Ask</span>
              <span>Size</span>
            </div>
            <div className="space-y-0.5">
              {book.asks.map((level, i) => (
                <Row key={i} side="ask" level={level} maxSize={book.maxSize} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-4">
          {[0, 1].map((col) => (
            <div key={col} className="space-y-1.5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-navy-light/40" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
