// Pure helpers for the mock market — no React here, so they're easy to reason
// about and reuse from both the dashboard and the 3D scene if it ever needs
// real price data (e.g. to drive particle color by market mood).

export const INSTRUMENTS = [
  { symbol: "GRDV", name: "Grand Voyage Holdings", basePrice: 184.2 },
  { symbol: "ABYS", name: "Abyssal Freight Co.", basePrice: 62.1 },
  { symbol: "CMPS", name: "Compass Dynamics", basePrice: 341.75 },
  { symbol: "TIDE", name: "Tidewave Energy", basePrice: 27.85 },
  { symbol: "MRDN", name: "Meridian Index Fund", basePrice: 128.4 },
  { symbol: "DRFT", name: "Driftwood Materials", basePrice: 9.42 },
];

export const STARTING_CASH = 100000;

/**
 * Advance one instrument's price by a small random-walk step, with a shared
 * market-wide drift so instruments feel loosely correlated rather than pure
 * noise.
 */
export function stepPrice(price, { marketDrift = 0, volatility = 0.35 } = {}) {
  const idiosyncratic = (Math.random() - 0.5) * volatility;
  const next = price * (1 + (marketDrift + idiosyncratic) / 100);
  return Math.max(0.01, next);
}

/**
 * Synthesize a bid/ask ladder around a last-trade price. Deterministic in
 * shape (spread grows with level) but randomized in size so it visibly
 * breathes between renders.
 */
export function generateOrderBook(price, levels = 8) {
  const tick = Math.max(price * 0.0007, 0.01);
  const bids = Array.from({ length: levels }, (_, i) => {
    const levelPrice = price - tick * (i + 1) * (1 + Math.random() * 0.3);
    const size = Math.round(15 + Math.random() * 60 * (levels - i));
    return { price: levelPrice, size };
  });
  const asks = Array.from({ length: levels }, (_, i) => {
    const levelPrice = price + tick * (i + 1) * (1 + Math.random() * 0.3);
    const size = Math.round(15 + Math.random() * 60 * (levels - i));
    return { price: levelPrice, size };
  });
  const maxSize = Math.max(...bids.map((b) => b.size), ...asks.map((a) => a.size));
  return { bids, asks, maxSize, spread: asks[0].price - bids[0].price };
}

export function formatCurrency(value, { compact = false } = {}) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
  }).format(value);
}

export function formatSigned(value, { decimals = 2, suffix = "" } = {}) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${Math.abs(value).toFixed(decimals)}${suffix}`;
}

export function formatSignedCurrency(value) {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}
