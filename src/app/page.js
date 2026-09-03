"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Compass, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { MarketProvider } from "@/lib/MarketProvider";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import PortfolioSummary from "@/components/trading/PortfolioSummary";
import Watchlist from "@/components/trading/Watchlist";
import PriceChart from "@/components/trading/PriceChart";
import OrderBook from "@/components/trading/OrderBook";
import TradeExecution from "@/components/trading/TradeExecution";
import ActivityLog from "@/components/trading/ActivityLog";
import { formatCurrency, STARTING_CASH } from "@/lib/market";

// Three.js touches `window` on import, and a WebGL context has nothing to
// render on the server anyway — load the whole scene client-only.
const OnePieceTradingCanvas = dynamic(() => import("@/components/canvas/OnePieceTradingCanvas"), {
  ssr: false,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      className="mb-8 max-w-2xl"
    >
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">{eyebrow}</span>
      <h2 className="mt-2 font-display text-2xl tracking-wide text-porcelain sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>}
    </motion.div>
  );
}

function DashboardExperience() {
  const [selectedSymbol, setSelectedSymbol] = useState("GRDV");

  return (
    <>
      <Navbar />
      <Sidebar />

      <main className="relative z-10">
        {/* ---------------------------------------------------------------- HERO */}
        <section id="hero" className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="show" variants={fadeUp} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-navy/50 px-3 py-1 text-xs text-mist backdrop-blur-sm">
              <Compass className="h-3 w-3 text-gold" strokeWidth={1.75} />
              Paper trading terminal — zero real-money risk
            </span>

            <h1 className="mt-6 font-display text-4xl leading-tight tracking-wide text-porcelain sm:text-5xl lg:text-6xl">
              Chart your own
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan via-porcelain to-gold">
                course.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-mist">
              Meridian is a simulated trading terminal for testing real strategies against
              live-feeling markets — starting with {formatCurrency(STARTING_CASH, { compact: true })} in
              practice capital and not one real dollar at risk.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-cyan px-5 py-2.5 text-sm font-semibold text-void-deep transition-transform hover:scale-[1.02]"
              >
                Enter the terminal
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
              </a>
              <a
                href="#markets"
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

        {/* ----------------------------------------------------------- DASHBOARD */}
        <section id="dashboard" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Portfolio"
            title="Your position, at a glance"
            description="Equity, cash, and holdings — recalculated on every simulated tick."
          />
          <PortfolioSummary />
        </section>

        {/* ------------------------------------------------------------- MARKETS */}
        <section id="markets" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Markets"
            title="Pick an instrument"
            description="Select anything below to load it into the order book and execution panel."
          />
          <div className="space-y-4">
            <PriceChart symbol={selectedSymbol} />
            <Watchlist selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
          </div>
        </section>

        {/* --------------------------------------------------------------- TRADE */}
        <section id="trade" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Execution"
            title="Place a simulated order"
            description="Market orders fill instantly at the live price; limit orders only fill if the price already qualifies."
          />
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <OrderBook symbol={selectedSymbol} />
            <TradeExecution symbol={selectedSymbol} />
          </div>
        </section>

        {/* ------------------------------------------------------------ ACTIVITY */}
        <section id="activity" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="History" title="Recent activity" />
          <ActivityLog />
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function Page() {
  return (
    <MarketProvider>
      <OnePieceTradingCanvas />
      <DashboardExperience />
    </MarketProvider>
  );
}
