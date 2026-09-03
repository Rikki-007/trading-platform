"use client";

import { motion } from "framer-motion";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency, formatSigned } from "@/lib/market";
import Sparkline from "./Sparkline";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Watchlist({ selectedSymbol, onSelect }) {
  const { instruments, quotes } = useMarket();

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3"
    >
      {instruments.map(({ symbol, name }) => {
        const quote = quotes[symbol];
        if (!quote) return null;
        const change = quote.price - quote.openPrice;
        const changePct = (change / quote.openPrice) * 100;
        const isUp = change >= 0;
        const isSelected = selectedSymbol === symbol;

        return (
          <motion.button
            key={symbol}
            variants={item}
            onClick={() => onSelect(symbol)}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden rounded-2xl border p-4 text-left backdrop-blur-md transition-colors ${
              isSelected
                ? "border-cyan/40 bg-navy-light/70"
                : "border-hairline bg-navy/50 hover:border-hairline-strong hover:bg-navy-light/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-sm font-semibold tracking-wide text-porcelain">{symbol}</div>
                <div className="mt-0.5 text-xs text-mist-dim line-clamp-1">{name}</div>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium font-variant-tabular ${
                  isUp ? "bg-cyan/10 text-cyan" : "bg-crimson/10 text-crimson"
                }`}
              >
                {formatSigned(changePct, { suffix: "%" })}
              </span>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <span className="font-mono text-xl font-variant-tabular text-porcelain">
                {formatCurrency(quote.price)}
              </span>
              <Sparkline
                data={quote.history}
                width={92}
                height={32}
                strokeWidth={1.5}
                color={isUp ? "#00f0ff" : "#ff2a5f"}
                animate={false}
              />
            </div>

            {isSelected && (
              <motion.span
                layoutId="watchlist-selected"
                className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
