"use client";

import SectionHeading from "@/components/layout/SectionHeading";
import PriceChart from "@/components/trading/PriceChart";
import Watchlist from "@/components/trading/Watchlist";
import { useSelection } from "@/lib/SelectionProvider";

export default function MarketsPage() {
  const { selectedSymbol, setSelectedSymbol } = useSelection();

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Markets"
        title="Pick an instrument"
        description="Select anything below to load it into the order book and execution panel on the Trade page."
      />
      <div className="space-y-4">
        <PriceChart symbol={selectedSymbol} />
        <Watchlist selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
      </div>
    </div>
  );
}
