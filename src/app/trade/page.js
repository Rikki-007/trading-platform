"use client";

import SectionHeading from "@/components/layout/SectionHeading";
import OrderBook from "@/components/trading/OrderBook";
import TradeExecution from "@/components/trading/TradeExecution";
import PortfolioSummary from "@/components/trading/PortfolioSummary";
import TrainingIntroModal from "@/components/trading/TrainingIntroModal";
import { useSelection } from "@/lib/SelectionProvider";

/**
 * Execution shares this page with a live view of the same $100,000 practice
 * capital it trades against — PortfolioSummary here is the same component
 * /training renders, not a second copy of the numbers, so Trade and
 * Training read as one unified practice-trading module rather than two
 * disconnected pages that happen to share a balance.
 */
export default function TradePage() {
  const { selectedSymbol } = useSelection();

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <TrainingIntroModal />
      <SectionHeading
        eyebrow="Execution"
        title="Place a simulated order"
        description="Market orders fill instantly at the live price; limit orders only fill if the price already qualifies — all against your $100,000 practice capital below."
      />
      <PortfolioSummary />
      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OrderBook symbol={selectedSymbol} />
        <TradeExecution symbol={selectedSymbol} />
      </div>
    </div>
  );
}
