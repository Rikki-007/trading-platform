"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Gauge, Crown, Ticket, ArrowRight, Loader2 } from "lucide-react";
import { setAccountTier } from "@/lib/onboarding/actions";

const STEPS = ["Welcome", "Choose your tier", "Promo code", "Done"];

const TIERS = [
  {
    id: "standard",
    icon: Gauge,
    name: "Standard",
    description: "Full paper-trading terminal — practice mode, all instruments, no cost.",
  },
  {
    id: "pro",
    icon: Crown,
    name: "Pro",
    description: "Everything in Standard, plus priority access to video consulting rooms.",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("standard");
  const [savingTier, setSavingTier] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState(null);
  const [promoPending, setPromoPending] = useState(false);

  async function handleTierNext() {
    setSavingTier(true);
    await setAccountTier(tier);
    setSavingTier(false);
    setStep(2);
  }

  async function handlePromoSubmit(e) {
    e.preventDefault();
    if (!promoCode.trim()) {
      setStep(3);
      return;
    }
    setPromoPending(true);
    try {
      const res = await fetch("/api/promo/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      const data = await res.json();
      setPromoResult(data);
      if (data.ok) setStep(3);
    } catch {
      setPromoResult({ ok: false, reason: "Something went wrong. Try again." });
    } finally {
      setPromoPending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-mono ${
                  i < step
                    ? "bg-cyan text-void-deep"
                    : i === step
                      ? "border border-cyan text-cyan"
                      : "border border-hairline text-mist-dim"
                }`}
              >
                {i < step ? <Check className="h-3 w-3" strokeWidth={2.5} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className="h-px w-6 bg-hairline" />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-hairline bg-navy/50 p-6 backdrop-blur-md">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h1 className="font-display text-xl text-porcelain">Welcome to Meridian</h1>
                <p className="mt-2 text-sm text-mist">
                  A couple of quick steps and you&rsquo;re in the terminal — starting with{" "}
                  <span className="text-porcelain">$100,000</span> in practice capital.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(1)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan py-2.5 text-sm font-semibold text-void-deep"
                >
                  Get started <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </motion.button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h1 className="font-display text-xl text-porcelain">Choose your tier</h1>
                <p className="mt-1 text-sm text-mist">You can change this later.</p>
                <div className="mt-4 flex flex-col gap-2">
                  {TIERS.map(({ id, icon: Icon, name, description }) => (
                    <button
                      key={id}
                      onClick={() => setTier(id)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        tier === id ? "border-cyan/50 bg-cyan/5" : "border-hairline hover:bg-navy-light/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${tier === id ? "text-cyan" : "text-mist"}`} strokeWidth={1.75} />
                        <span className="text-sm font-semibold text-porcelain">{name}</span>
                      </div>
                      <p className="mt-1 text-xs text-mist-dim">{description}</p>
                    </button>
                  ))}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleTierNext}
                  disabled={savingTier}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan py-2.5 text-sm font-semibold text-void-deep disabled:opacity-60"
                >
                  {savingTier ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" strokeWidth={2} /></>}
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                <h1 className="font-display text-xl text-porcelain">Have a promo code?</h1>
                <p className="mt-1 text-sm text-mist">Optional — skip if you don&apos;t have one.</p>
                <form onSubmit={handlePromoSubmit} className="mt-4">
                  <div className="relative">
                    <Ticket className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-dim" strokeWidth={1.75} />
                    <input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="STARTBOOST"
                      className="w-full rounded-lg border border-hairline bg-void-deep/50 py-2 pl-9 pr-3 font-mono text-sm uppercase tracking-wider text-porcelain outline-none transition-colors focus:border-cyan/50"
                    />
                  </div>
                  {promoResult && !promoResult.ok && (
                    <p className="mt-2 text-xs text-crimson">{promoResult.reason}</p>
                  )}
                  {promoResult?.ok && (
                    <p className="mt-2 text-xs text-cyan">Code applied — bonus credited to your account.</p>
                  )}
                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 rounded-lg border border-hairline py-2.5 text-sm text-mist transition-colors hover:text-porcelain"
                    >
                      Skip
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={promoPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan py-2.5 text-sm font-semibold text-void-deep disabled:opacity-60"
                    >
                      {promoPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cyan/10 text-cyan">
                  <Check className="h-6 w-6" strokeWidth={2} />
                </div>
                <h1 className="mt-3 font-display text-xl text-porcelain">You&rsquo;re all set</h1>
                <p className="mt-1 text-sm text-mist">Your terminal is ready.</p>
                <motion.a
                  whileTap={{ scale: 0.97 }}
                  href="/"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan py-2.5 text-sm font-semibold text-void-deep"
                >
                  Enter the terminal <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
