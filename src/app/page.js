"use client";

import { motion } from "framer-motion";
import { Compass, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import FeatureCards from "@/components/home/FeatureCards";
import MicroTilt from "@/components/motion/MicroTilt";
import { useAppReveal } from "@/lib/AppReveal";
import { heroReveal } from "@/lib/motionVariants";
import { formatCurrency, STARTING_CASH } from "@/lib/market";

/**
 * The home route — hero branding and the four feature cards, nothing else.
 * Every other module (dashboard, markets, trade, training, live) now lives
 * on its own route under src/app/*.
 */
export default function HomePage() {
  const { ready } = useAppReveal();

  return (
    <>
      {/* ---------------------------------------------------------------- HERO */}
      <section id="hero" className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate={ready ? "show" : "hidden"}
          variants={heroReveal}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-navy/50 px-3 py-1 text-xs text-mist backdrop-blur-sm">
            <Compass className="h-3 w-3 text-gold" strokeWidth={1.75} />
            Paper trading terminal — zero real-money risk
          </span>

          <MicroTilt strength={2.5} className="mt-7 block">
            <h1 className="font-display leading-[1.05] text-porcelain">
              <span className="block text-lg tracking-[0.42em] text-mist sm:text-xl">LODESTAR</span>
              <span className="mt-1 block text-4xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan via-porcelain to-gold sm:text-6xl lg:text-7xl">
                Meridian Exchange
              </span>
            </h1>
          </MicroTilt>

          <p className="mt-6 max-w-lg text-lg italic text-mist-dim">Chart your own course.</p>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-mist">
            A simulated trading terminal for testing real strategies against live-feeling
            markets — starting with {formatCurrency(STARTING_CASH, { compact: true })} in
            practice capital and not one real dollar at risk.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-void-deep transition-transform hover:scale-[1.02]"
            >
              Enter the terminal
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </a>
            <a
              href="/markets"
              className="inline-flex items-center gap-2 rounded-full border border-hairline-strong px-5 py-2.5 text-sm text-porcelain transition-colors hover:bg-navy-light"
            >
              Browse markets
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-6 text-xs text-mist-dim">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan" strokeWidth={1.75} />
              No real funds, ever
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={1.75} />
              Live-feeling simulated ticks
            </span>
          </div>
        </motion.div>
      </section>

      {/* ------------------------------------------------------------ FEATURES */}
      <FeatureCards />
    </>
  );
}
