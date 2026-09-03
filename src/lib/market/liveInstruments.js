// Real, tradable symbols for the live-data panel — deliberately separate
// from src/lib/market.js's fictional practice-tier instruments (GRDV, ABYS,
// etc.), which don't correspond to anything Polygon.io can quote. Edit this
// list to whatever you actually want quoted; it's config, not logic.
export const LIVE_INSTRUMENTS = [
  { symbol: "AAPL", name: "Apple Inc.", assetClass: "stocks" },
  { symbol: "MSFT", name: "Microsoft Corp.", assetClass: "stocks" },
  { symbol: "TSLA", name: "Tesla, Inc.", assetClass: "stocks" },
  { symbol: "X:BTCUSD", name: "Bitcoin / USD", assetClass: "crypto" },
  { symbol: "X:ETHUSD", name: "Ethereum / USD", assetClass: "crypto" },
  { symbol: "C:EURUSD", name: "Euro / US Dollar", assetClass: "forex" },
];
