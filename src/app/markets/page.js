import { redirect } from "next/navigation";

/**
 * The simulated instrument picker (PriceChart + Watchlist) that used to
 * live here moved to /virtual-trading, consolidated alongside execution and
 * the portfolio — see src/app/virtual-trading/page.js. Real market data
 * (LiveMarketsPanel) moved to /live-trading instead, since it belongs with
 * the real-market side of the platform, not the practice one. This
 * redirect exists so an old bookmark or link still lands somewhere real.
 */
export default function MarketsPage() {
  redirect("/virtual-trading");
}
