"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency } from "@/lib/market";

const ORDER_TYPES = ["Market", "Limit"];

export default function TradeExecution({ symbol }) {
  const { quotes, positions, executeTrade } = useMarket();
  const quote = quotes[symbol];
  const held = positions[symbol]?.qty ?? 0;

  const [side, setSide] = useState("buy");
  const [orderType, setOrderType] = useState("Market");
  const [qty, setQty] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [feedback, setFeedback] = useState(null); // { ok, message }

  const qtyNum = Number(qty) || 0;
  const estCost = qtyNum * (quote?.price ?? 0);

  const limitPlaceholder = useMemo(() => (quote ? quote.price.toFixed(2) : ""), [quote]);

  useEffect(() => {
    if (!feedback) return;
    const id = setTimeout(() => setFeedback(null), 2600);
    return () => clearTimeout(id);
  }, [feedback]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!quote || qtyNum <= 0) {
      setFeedback({ ok: false, message: "Enter a quantity greater than zero." });
      return;
    }

    if (orderType === "Limit") {
      const limit = Number(limitPrice);
      if (!limit || limit <= 0) {
        setFeedback({ ok: false, message: "Enter a limit price." });
        return;
      }
      const wouldFill = side === "buy" ? quote.price <= limit : quote.price >= limit;
      if (!wouldFill) {
        setFeedback({
          ok: false,
          message: `Not filled — last price ${formatCurrency(quote.price)} hasn't reached your limit of ${formatCurrency(limit)} yet.`,
        });
        return;
      }
    }

    const result = executeTrade({ symbol, side, qty: qtyNum });
    if (result.ok) {
      const filledQty = result.qty ?? qtyNum;
      setFeedback({
        ok: true,
        message: `${side === "buy" ? "Bought" : "Sold"} ${filledQty} ${symbol} @ ${formatCurrency(quote.price)}`,
      });
      setQty("1");
    } else {
      setFeedback({ ok: false, message: result.reason ?? "Order could not be filled." });
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-navy/50 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div>
          <span className="text-xs uppercase tracking-wider text-mist">Execute</span>
          <div className="font-mono text-sm text-porcelain">{symbol}</div>
        </div>
        <div className="text-right text-xs text-mist-dim">
          You hold <span className="font-mono text-porcelain">{held}</span> shares
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-hairline bg-void-deep/40 p-1">
        {["buy", "sell"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSide(s)}
            className={`relative rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
              side === s
                ? s === "buy"
                  ? "bg-cyan/15 text-cyan"
                  : "bg-crimson/15 text-crimson"
                : "text-mist hover:text-porcelain"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex gap-2">
          {ORDER_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setOrderType(t)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                orderType === t
                  ? "border-gold/40 bg-gold/10 text-gold"
                  : "border-hairline text-mist hover:text-porcelain"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="block text-xs text-mist">
          Quantity
          <input
            type="number"
            min="0"
            step="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="mt-1 w-full rounded-lg border border-hairline bg-void-deep/50 px-3 py-2 font-mono text-sm text-porcelain outline-none transition-colors focus:border-cyan/50"
          />
        </label>

        {orderType === "Limit" && (
          <label className="block text-xs text-mist">
            Limit price
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={limitPlaceholder}
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              className="mt-1 w-full rounded-lg border border-hairline bg-void-deep/50 px-3 py-2 font-mono text-sm text-porcelain outline-none transition-colors focus:border-cyan/50"
            />
          </label>
        )}

        <div className="flex items-center justify-between rounded-lg bg-void-deep/40 px-3 py-2 text-xs">
          <span className="text-mist">Est. {side === "buy" ? "cost" : "proceeds"}</span>
          <span className="font-mono font-variant-tabular text-porcelain">{formatCurrency(estCost)}</span>
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-colors ${
            side === "buy"
              ? "bg-cyan text-void-deep hover:bg-cyan/90"
              : "bg-crimson text-void-deep hover:bg-crimson/90"
          }`}
        >
          {side === "buy" ? "Buy" : "Sell"} {symbol}
        </motion.button>
      </form>

      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={feedback.message}
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.25 }}
            className={`mt-3 flex items-start gap-2 overflow-hidden rounded-lg border px-3 py-2 text-xs ${
              feedback.ok
                ? "border-cyan/25 bg-cyan/10 text-cyan"
                : "border-crimson/25 bg-crimson/10 text-crimson"
            }`}
          >
            {feedback.ok ? (
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            ) : (
              <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            )}
            <span>{feedback.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
