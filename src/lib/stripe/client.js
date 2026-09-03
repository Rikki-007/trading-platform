import Stripe from "stripe";

let stripeClient = null;

/** Returns a configured Stripe client, or null if STRIPE_SECRET_KEY isn't set. */
export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;

  if (!stripeClient) {
    stripeClient = new Stripe(key, { apiVersion: "2026-08-26.dahlia" });
  }
  return stripeClient;
}
