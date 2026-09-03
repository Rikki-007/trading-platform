"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radio, ArrowDownLeft, ArrowUpRight, Send } from "lucide-react";
import { useBroadcastFeed } from "@/lib/notifications/useBroadcastFeed";
import { formatCurrency } from "@/lib/market";

/** Formats a Postgres timestamptz as a short relative "Xs/m/h ago" string. */
function timeAgo(iso) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function BroadcastFeed() {
  const { broadcasts, connected } = useBroadcastFeed();
  const [isAdmin, setIsAdmin] = useState(false);
  const [form, setForm] = useState({ symbol: "", side: "buy", qty: "", price: "", note: "" });
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setIsAdmin(Boolean(data?.profile?.is_admin)))
      .catch(() => {});
  }, []);

  async function handlePost(e) {
    e.preventDefault();
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: form.symbol,
          side: form.side,
          qty: Number(form.qty),
          priceCents: Math.round(Number(form.price) * 100),
          note: form.note,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.reason);
      setForm({ symbol: "", side: "buy", qty: "", price: "", note: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-hairline bg-navy/50 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <Radio className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
          <span className="text-xs uppercase tracking-wider text-mist">Trade broadcasts</span>
        </div>
        <span className={`flex items-center gap-1.5 text-[11px] ${connected ? "text-cyan" : "text-mist-dim"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-cyan animate-pulse-slow" : "bg-mist-dim"}`} />
          {connected ? "Live" : "Not connected"}
        </span>
      </div>

      {isAdmin && (
        <form onSubmit={handlePost} className="mt-4 space-y-2 border-b border-hairline pb-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <input
              placeholder="Symbol"
              value={form.symbol}
              onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
              className="rounded-lg border border-hairline bg-void-deep/50 px-2.5 py-1.5 font-mono text-xs text-porcelain outline-none focus:border-cyan/50"
            />
            <select
              value={form.side}
              onChange={(e) => setForm((f) => ({ ...f, side: e.target.value }))}
              className="rounded-lg border border-hairline bg-void-deep/50 px-2.5 py-1.5 text-xs text-porcelain outline-none focus:border-cyan/50"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <input
              placeholder="Qty"
              type="number"
              value={form.qty}
              onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
              className="rounded-lg border border-hairline bg-void-deep/50 px-2.5 py-1.5 font-mono text-xs text-porcelain outline-none focus:border-cyan/50"
            />
            <input
              placeholder="Price"
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              className="rounded-lg border border-hairline bg-void-deep/50 px-2.5 py-1.5 font-mono text-xs text-porcelain outline-none focus:border-cyan/50"
            />
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Optional note"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="flex-1 rounded-lg border border-hairline bg-void-deep/50 px-2.5 py-1.5 text-xs text-porcelain outline-none focus:border-cyan/50"
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={posting}
              className="flex items-center gap-1.5 rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-void-deep disabled:opacity-60"
            >
              <Send className="h-3 w-3" strokeWidth={2} /> Broadcast
            </motion.button>
          </div>
          {error && <p className="text-xs text-crimson">{error}</p>}
        </form>
      )}

      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
        {broadcasts.length === 0 && (
          <p className="py-6 text-center text-xs text-mist-dim">No broadcasts yet.</p>
        )}
        <AnimatePresence initial={false}>
          {broadcasts.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm"
            >
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${b.side === "buy" ? "bg-cyan/10 text-cyan" : "bg-crimson/10 text-crimson"}`}>
                {b.side === "buy" ? <ArrowDownLeft className="h-3.5 w-3.5" strokeWidth={2} /> : <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />}
              </span>
              <span className="flex-1 font-mono text-porcelain">
                {b.qty} <span className="text-mist-dim">{b.symbol}</span> @ {formatCurrency(b.price_cents / 100)}
              </span>
              <span className="text-xs text-mist-dim">{timeAgo(b.created_at)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
