"use client";

import SectionHeading from "@/components/layout/SectionHeading";
import OrderBook from "@/components/trading/OrderBook";
import TradeExecution from "@/components/trading/TradeExecution";
import { useSelection } from "@/lib/SelectionProvider";

export default function TradePage() {
  const { selectedSymbol } = useSelection();

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
  );
}
