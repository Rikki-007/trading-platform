"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Wallet, LineChart, ShieldCheck, ArrowRight } from "lucide-react";
import { formatCurrency, STARTING_CASH } from "@/lib/market";

const SEEN_KEY = "meridian_training_intro_seen";

const POINTS = [
  {
    icon: Wallet,
    text: `Every account starts with ${formatCurrency(STARTING_CASH, {
      compact: true,
    })} in practice capital — no real money is ever involved.`,
  },
  {
    icon: LineChart,
    text: "Pick an instrument below, then fill a real order against it — prices move on a live-feeling simulated feed.",
  },
  {
    icon: ShieldCheck,
    text: "Your equity, positions, and every fill are tracked right here, so you can review the whole history anytime — and reset your balance for a clean start whenever you want.",
  },
];

/**
 * A one-time walkthrough for first-time visitors to the Virtual Trading
 * page. Deliberately short: three lines, not a wall of text, so it's
 * skimmable in a few seconds rather than something people reflexively
 * click past.
 *
 * Starts closed on the server and on first client paint — the localStorage
 * check only runs inside an effect — so there's no hydration mismatch and
 * no flash for returning visitors who already dismissed it.
 */
export default function TrainingIntroModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(SEEN_KEY)) {
        // One-time read of an external system (localStorage) on mount to
        // decide initial visibility — same pattern as MarketProvider's
        // equity-history effect, not a state->state cascade.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpen(true);
      }
    } catch {
      // localStorage unavailable (private browsing, disabled storage, etc.)
      // — just skip the intro rather than throwing.
    }
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Nothing to do if storage can't persist the flag — worst case, it
      // shows again next visit.
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void-deep/70 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={dismiss}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="training-intro-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="relative w-full max-w-md rounded-2xl border border-hairline-strong bg-navy/90 p-6 shadow-2xl backdrop-blur-xl"
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              className="absolute right-4 top-4 text-mist-dim transition-colors hover:text-porcelain"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Welcome</span>
            <h2 id="training-intro-title" className="mt-2 font-display text-xl text-porcelain">
              How practice trading works
            </h2>

            <ul className="mt-5 space-y-3">
              {POINTS.map(({ icon: Icon, text }, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-hairline-strong bg-void-deep/50 text-cyan">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </span>
                  <p className="text-sm leading-relaxed text-mist">{text}</p>
                </li>
              ))}
            </ul>

            <button
              onClick={dismiss}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan py-2.5 text-sm font-semibold text-void-deep transition-transform hover:scale-[1.01]"
            >
              Got it
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
