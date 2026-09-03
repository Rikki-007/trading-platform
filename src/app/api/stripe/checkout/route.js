import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { MIN_DEPOSIT_CENTS } from "@/lib/stripe/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Creates a Stripe Checkout Session for either the funded-tier deposit or a
 * premium subscription. Always runs against whichever Stripe keys are
 * configured (test or live) — see src/lib/stripe/config.js for what
 * actually happens to the money once Stripe confirms payment; this route
 * only ever *starts* a checkout, it never touches the wallet balance.
 */
export async function POST(request) {
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ ok: false, reason: "Payments aren't configured yet." }, { status: 503 });
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, reason: "Auth isn't configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "Sign in first." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const type = body?.type === "subscription" ? "subscription" : "deposit";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  try {
    if (type === "subscription") {
      const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
      if (!priceId) {
        return NextResponse.json(
          { ok: false, reason: "No subscription plan is configured yet." },
          { status: 503 }
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer_email: user.email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${siteUrl}/?checkout=success`,
        cancel_url: `${siteUrl}/?checkout=cancelled`,
        metadata: { userId: user.id, kind: "subscription" },
      });

      return NextResponse.json({ ok: true, url: session.url });
    }

    // Deposit — a one-off payment for at least MIN_DEPOSIT_CENTS.
    const amountCents = Math.max(
      MIN_DEPOSIT_CENTS,
      Number.isFinite(body?.amountCents) ? Math.round(body.amountCents) : MIN_DEPOSIT_CENTS
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: amountCents,
            product_data: {
              name: "Meridian funded-tier deposit",
              description: "Funds the live-account ledger balance.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/?checkout=success`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
      metadata: { userId: user.id, kind: "deposit" },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: err.message || "Checkout failed." }, { status: 500 });
  }
}
