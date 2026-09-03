/**
 * Minimal Polygon.io REST client for one-shot "current price" snapshots.
 *
 * Deliberately REST-polling rather than Polygon's WebSocket feed: Vercel's
 * serverless functions aren't long-lived processes, so a persistent
 * server-side WebSocket relay doesn't work there without a separate
 * always-on service. Polling every few seconds from the client (see
 * useLiveQuotes.js) is the option that actually works on this project's
 * current (serverless) hosting — swap this for a real WebSocket relay if
 * you move market-data fetching to a long-running service.
 */

const BASE_URL = "https://api.polygon.io";

const LOCALE_BY_ASSET_CLASS = {
  stocks: "us/markets/stocks",
  crypto: "global/markets/crypto",
  forex: "global/markets/forex",
};

/** Fetches one symbol's latest snapshot and normalizes it to { price, prevClose, changePct }. */
export async function getPolygonQuote(symbol, assetClass, apiKey) {
  const localePath = LOCALE_BY_ASSET_CLASS[assetClass];
  if (!localePath) throw new Error(`Unknown asset class: ${assetClass}`);

  const url = `${BASE_URL}/v2/snapshot/locale/${localePath}/tickers/${encodeURIComponent(symbol)}?apiKey=${apiKey}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Polygon request failed (${res.status}) for ${symbol}`);
  }

  const json = await res.json();
  const t = json?.ticker;
  if (!t) throw new Error(`No snapshot data for ${symbol}`);

  // Stocks/crypto snapshots carry `lastTrade.p`; forex carries `lastQuote`
  // (bid/ask) instead of a last-trade price, so fall back to the
  // bid/ask midpoint, and finally to the prior day's close if neither is
  // present (e.g. outside market hours for a stock with no trade yet today).
  const price =
    t.lastTrade?.p ??
    (t.lastQuote ? (t.lastQuote.b + t.lastQuote.a) / 2 : undefined) ??
    t.day?.c ??
    t.prevDay?.c;

  const prevClose = t.prevDay?.c ?? price;

  if (price == null) throw new Error(`No usable price field for ${symbol}`);

  return {
    symbol,
    price,
    prevClose,
    changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetches quotes for a list of { symbol, assetClass } instruments in
 * parallel. Each failure is isolated — one bad symbol doesn't take down the
 * rest of the batch.
 */
export async function getPolygonQuotes(instruments, apiKey) {
  const results = await Promise.all(
    instruments.map(async ({ symbol, assetClass }) => {
      try {
        return await getPolygonQuote(symbol, assetClass, apiKey);
      } catch (err) {
        return { symbol, error: err.message };
      }
    })
  );
  return results;
}
