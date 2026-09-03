import { GraduationCap } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";
import PortfolioSummary from "@/components/trading/PortfolioSummary";
import ActivityLog from "@/components/trading/ActivityLog";
import { formatCurrency, STARTING_CASH } from "@/lib/market";

export const metadata = { title: "Virtual Stock Training — Lodestar Meridian Exchange" };

/**
 * "Virtual Stock Training" is the practice environment itself — the
 * $100,000 mock-capital account, its live portfolio, and its fill history
 * — not a separate curriculum page bolted next to it. Tutorials are a real,
 * planned addition (see the panel below) but the simulation is the actual
 * core of this page today, and is treated as such: it's the first thing on
 * the page, not an afterthought under a "coming soon" banner.
 */
export default function TrainingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Virtual Stock Training"
        title={`Your ${formatCurrency(STARTING_CASH, { compact: true })} practice environment`}
        description="Every account starts here — real order execution, a live portfolio, and a full fill history, against a simulated market with zero real-money risk."
      />
      <PortfolioSummary />

      <div id="activity" className="mt-20 scroll-mt-24">
        <SectionHeading eyebrow="History" title="Recent activity" />
        <ActivityLog />
      </div>

      <div className="mt-20">
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
