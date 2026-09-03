import { Landmark, ShieldAlert } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";
import LiveMarketsPanel from "@/components/trading/LiveMarketsPanel";

export const metadata = { title: "Live Trading — Lodestar Meridian Exchange" };

/**
 * The real-market side of the platform — live prices via Polygon.io, and
 * the broker-integration surface for actual execution once one is wired
 * up. Deliberately separate from Virtual Trading: that page is explicit
 * about being a zero-risk simulation, and this page needs to be equally
 * explicit about being the opposite — real prices, and (once configured) a
 * real broker in the loop. See BROKER_INTEGRATION.md / .env.example for
 * how to connect one; until then, this page is honest that it isn't.
 */
export default function LiveTradingPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Live Trading"
        title="Real market data & broker execution"
        description="Live prices sourced from Polygon.io. Broker integration for real order execution is configured separately and stays off until it's explicitly turned on."
      />

      <LiveMarketsPanel />

      <div className="mt-6 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-hairline-strong bg-navy/30 p-6 sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-hairline-strong bg-void-deep/50 text-gold">
          <Landmark className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-porcelain">Broker execution — not yet connected</p>
            <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
              In progress
            </span>
          </div>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-mist">
            Placing a real order here will route through a licensed broker partner via API once
            that integration is live — nothing on this page executes real trades today. Practice
            first on{" "}
            <a href="/virtual-trading" className="text-cyan underline underline-offset-2">
              Virtual Trading
            </a>
            .
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-hairline bg-void-deep/30 p-4 text-xs leading-relaxed text-mist-dim">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-crimson" strokeWidth={1.75} />
        <span>
          Real trading involves the risk of loss. Nothing on Meridian is investment advice —
          consult a licensed advisor before committing real capital.
        </span>
      </div>
    </div>
  );
}
