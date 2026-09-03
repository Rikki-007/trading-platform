"use client";

import { motion } from "framer-motion";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency, formatSigned } from "@/lib/market";
import Sparkline from "./Sparkline";

export default function PriceChart({ symbol }) {
  const { quotes, instruments } = useMarket();
  const quote = quotes[symbol];
  const meta = instruments.find((i) => i.symbol === symbol);
  if (!quote || !meta) return null;

  const change = quote.price - quote.openPrice;
  const changePct = (change / quote.openPrice) * 100;
  const isUp = change >= 0;

  return (
    <motion.div
      key={symbol}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-2xl border border-hairline bg-navy/50 p-6 backdrop-blur-md"
    >
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-semibold text-porcelain">{symbol}</span>
            <span className="text-sm text-mist-dim">{meta.name}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-variant-tabular text-porcelain">
              {formatCurrency(quote.price)}
            </span>
            <span className={`font-mono text-sm font-variant-tabular ${isUp ? "text-cyan" : "text-crimson"}`}>
              {formatSigned(change)} ({formatSigned(changePct, { suffix: "%" })})
            </span>
          </div>
        </div>
        <Sparkline
          data={quote.history}
          width={320}
          height={88}
          strokeWidth={2}
          color={isUp ? "#00f0ff" : "#ff2a5f"}
          className="w-full sm:w-auto"
        />
      </div>
    </motion.div>
  );
}
