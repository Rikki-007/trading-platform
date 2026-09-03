"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Check } from "lucide-react";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency, STARTING_CASH } from "@/lib/market";

/**
 * Free top-up/reset for the practice account — wipes cash, positions, and
 * fill history back to a clean STARTING_CASH balance. A plain `confirm()`
 * guards it rather than a custom modal: this is a low-stakes, fully
 * reversible (there's nothing real to lose) action, so a native confirm is
 * enough friction to stop a misclick without building UI for it.
 */
export default function ResetBalanceButton() {
  const { resetAccount } = useMarket();
  const [justReset, setJustReset] = useState(false);

  function handleClick() {
    const ok = window.confirm(
      `Reset your practice account back to ${formatCurrency(STARTING_CASH, {
        compact: true,
      })}? This clears all open positions and fill history.`
    );
    if (!ok) return;
    resetAccount();
    setJustReset(true);
    setTimeout(() => setJustReset(false), 2200);
  }

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={handleClick}
      className="flex items-center gap-1.5 rounded-full border border-hairline-strong bg-navy/50 px-3.5 py-1.5 text-xs font-medium text-mist transition-colors hover:border-gold/40 hover:text-gold"
    >
      {justReset ? (
        <>
          <Check className="h-3.5 w-3.5 text-cyan" strokeWidth={2} />
          Reset
        </>
      ) : (
        <>
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.75} />
          Top up / reset balance
        </>
      )}
    </motion.button>
  );
}
