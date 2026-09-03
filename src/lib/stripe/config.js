/**
 * Central place for every Stripe-related flag/constant. Nothing here reads
 * a Stripe secret — it's config only.
 */

// The €250 funded-tier minimum deposit, in cents. Configurable via env so
// it can be raised/lowered without a code change, but defaults to the
// figure specified in MERIDIAN_PHASE2_REPORT.md.
export const MIN_DEPOSIT_CENTS = Number(process.env.NEXT_PUBLIC_MIN_DEPOSIT_CENTS || 25000);

/**
 * ============================================================================
 * PAYMENTS_LIVE_MODE — read this before ever setting it to "true"
 * ============================================================================
 * This flag, not Stripe's own test/live key pair, is what decides whether a
 * completed deposit actually credits `wallets.live_balance_cents` (see the
 * webhook handler). With it off (the default), the checkout flow and
 * webhook run end-to-end against Stripe *test mode* — nothing is charged,
 * nothing is spendable — so the integration can be built, demoed, and
 * QA'd safely.
 *
 * Flipping it to "true" makes this platform directly hold client funds
 * (Stripe -> this app's own ledger), which MERIDIAN_PHASE2_REPORT.md
 * Section 5 explicitly recommends against: self-custody needs
 * $250,000+ in money-transmitter/broker-dealer licensing before it's
 * legal, versus routing deposits through a licensed broker partner who
 * already holds that license. Do not set this to "true" until:
 *
 *   1. A licensed broker partner (or equivalent licensing) is actually in
 *      place for the jurisdictions you're serving, and
 *   2. Legal has signed off specifically on this deposit flow.
 *
 * See MERIDIAN_PHASE2_REPORT.md, Sections 3.4 and 5.
 * ============================================================================
 */
export const PAYMENTS_LIVE_MODE = process.env.PAYMENTS_LIVE_MODE === "true";
