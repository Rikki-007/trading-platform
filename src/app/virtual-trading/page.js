"use client";

import { GraduationCap } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";
import PriceChart from "@/components/trading/PriceChart";
import Watchlist from "@/components/trading/Watchlist";
import OrderBook from "@/components/trading/OrderBook";
import TradeExecution from "@/components/trading/TradeExecution";
import PortfolioSummary from "@/components/trading/PortfolioSummary";
import ActivityLog from "@/components/trading/ActivityLog";
import ResetBalanceButton from "@/components/trading/ResetBalanceButton";
import TrainingIntroModal from "@/components/trading/TrainingIntroModal";
import { useSelection } from "@/lib/SelectionProvider";
import { formatCurrency, STARTING_CASH } from "@/lib/market";

/**
 * The single, unified practice-trading module. Everything that was once
 * spread across /markets (instrument picker), /trade (order execution), and
 * /training (portfolio + fill history) now lives on this one page, in the
 * order someone would actually use it top to bottom: see your capital, pick
 * an instrument, place an order, watch it land in the log. Nothing here
 * touches real money or a real broker — that's the separate Live Trading
 * page.
 */
export default function VirtualTradingPage() {
  const { selectedSymbol, setSelectedSymbol } = useSelection();

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <TrainingIntroModal />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Virtual Trading"
          title={`Your ${formatCurrency(STARTING_CASH, { compact: true })} practice environment`}
          description="Pick an instrument, place a real order against a live-feeling simulated price, and watch it land in your fill history — zero real-money risk, ever."
        />
        <div className="pt-1">
          <ResetBalanceButton />
        </div>
      </div>

      <PortfolioSummary />

      <div className="mt-16 space-y-4">
        <SectionHeading eyebrow="Instruments" title="Pick a symbol" />
        <PriceChart symbol={selectedSymbol} />
        <Watchlist selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
      </div>

      <div className="mt-16">
        <SectionHeading
          eyebrow="Execution"
          title="Place a simulated order"
          description="Market orders fill instantly at the live price; limit orders only fill if the price already qualifies."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <OrderBook symbol={selectedSymbol} />
          <TradeExecution symbol={selectedSymbol} />
        </div>
      </div>

      <div id="activity" className="mt-16 scroll-mt-24">
        <SectionHeading eyebrow="History" title="Recent activity" />
        <ActivityLog />
      </div>

      <div className="mt-16">
        <SectionHeading
          eyebrow="Curriculum"
          title="Tutorials & strategy guides"
          description="A structured curriculum for learning the terminal and testing real strategies — in active development."
        />
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-hairline-strong bg-navy/30 p-8 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-hairline-strong bg-void-deep/50 text-gold">
            <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-porcelain">Coming soon</p>
              <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
                In progress
              </span>
            </div>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-mist">
              Planned topics: reading an order book, market vs. limit orders, position sizing,
              and a walkthrough of every panel in this terminal. Nothing here is published yet —
              this section is honest about that until it is.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
