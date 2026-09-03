"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { User, Wallet, ArrowDownLeft, ArrowUpRight, LogOut, ChevronDown } from "lucide-react";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency } from "@/lib/market";
import { signOut } from "@/lib/auth/actions";

/**
 * The 5th "tab" — separated from the 4 main nav links by design, per the
 * request. Two states: signed out renders a plain "Sign Up / Log In" link;
 * signed in renders a trigger that opens a dropdown with wallet balance and
 * recent trade history, so account state is one click away from anywhere
 * in the app instead of living only on /virtual-trading.
 */
export default function ProfileMenu({ me }) {
  const { equity, cash, trades } = useMarket();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (me === undefined) return null; // still loading — avoid a flash of the wrong state

  if (me === null) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-full bg-cyan px-3.5 py-1.5 text-xs font-semibold text-void-deep transition-transform hover:scale-[1.02]"
      >
        <User className="h-3.5 w-3.5" strokeWidth={2} />
        Sign Up / Log In
      </Link>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-hairline bg-navy/50 px-3 py-1.5 text-sm transition-colors hover:border-hairline-strong"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan/15 text-cyan">
          <User className="h-3 w-3" strokeWidth={2} />
        </span>
        <span className="hidden font-mono font-variant-tabular text-porcelain sm:inline">
          {formatCurrency(equity, { compact: true })}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-mist-dim transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-hairline-strong bg-navy/95 p-4 shadow-2xl backdrop-blur-xl"
          >
            <p className="truncate text-xs text-mist-dim" title={me.email}>
              {me.email}
            </p>

            <div className="mt-3 flex items-center gap-2 rounded-xl border border-hairline bg-void-deep/40 p-3">
              <Wallet className="h-4 w-4 text-gold" strokeWidth={1.75} />
              <div>
                <div className="font-mono text-lg font-semibold font-variant-tabular text-porcelain">
                  {formatCurrency(equity)}
                </div>
                <div className="text-[11px] text-mist-dim">
                  {formatCurrency(cash, { compact: true })} cash available
                </div>
              </div>
            </div>

            <div className="mt-3 border-t border-hairline pt-3">
              <p className="text-[11px] uppercase tracking-wider text-mist-dim">Recent transactions</p>
              {trades.length === 0 ? (
                <p className="mt-2 text-xs text-mist-dim">No trades yet.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {trades.slice(0, 3).map((t) => (
                    <li key={t.id} className="flex items-center gap-2 text-xs">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          t.side === "buy" ? "bg-cyan/10 text-cyan" : "bg-crimson/10 text-crimson"
                        }`}
                      >
                        {t.side === "buy" ? (
                          <ArrowDownLeft className="h-3 w-3" strokeWidth={2} />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                        )}
                      </span>
                      <span className="flex-1 truncate font-mono text-porcelain">
                        {t.qty} {t.symbol}
                      </span>
                      <span className="text-mist-dim">{formatCurrency(t.price, { compact: true })}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/virtual-trading#activity"
                onClick={() => setOpen(false)}
                className="mt-2 inline-block text-xs font-medium text-cyan hover:underline"
              >
                View full trade history →
              </Link>
            </div>

            <form action={signOut} className="mt-3 border-t border-hairline pt-3">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-hairline py-2 text-xs text-mist transition-colors hover:text-porcelain"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                Sign out
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
