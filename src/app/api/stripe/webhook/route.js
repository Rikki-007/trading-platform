import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { PAYMENTS_LIVE_MODE } from "@/lib/stripe/config";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * ============================================================================
 * Stripe webhook — READ THIS BEFORE CHANGING ANYTHING BELOW
 * ============================================================================
 * This route is the one place in the codebase that would credit real,
 * spendable money to a user if it ran unguarded. It is deliberately gated by
 * PAYMENTS_LIVE_MODE (src/lib/stripe/config.js), which defaults to false:
 * a completed Stripe payment is recorded in `deposits` for audit purposes,
 * but `wallets.live_balance_cents` is only ever incremented when that flag
 * is explicitly "true" in the deployment's environment variables.
 *
 * MERIDIAN_PHASE2_REPORT.md (Sections 3.4 and 5) recommends routing
 * funded-tier deposits through a licensed broker partner rather than this
 * app holding client funds directly — self-custody is a $250,000+
 * licensing decision, not just an engineering one. Don't flip that flag
 * without that decision having actually been made.
 * ============================================================================
 */
export async function POST(request) {
  const stripe = getStripeClient();
  const admin = getSupabaseAdminClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !admin || !webhookSecret) {
    // Not configured — acknowledge with 200 so Stripe doesn't retry forever,
    // there's nothing this deployment can do with the event yet.
    return NextResponse.json({ received: true, note: "Webhook not configured." });
  }

  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text(); // Stripe signature verification needs the raw bytes.

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${err.message}` }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const userId = session.metadata?.userId;
  const kind = session.metadata?.kind;

  if (!userId) {
    return NextResponse.json({ received: true, note: "No userId in metadata." });
  }

  // Idempotency: a webhook can be delivered more than once for the same
  // event. If we've already recorded this checkout session as completed,
  // don't credit the ledger a second time.
  const { data: existing } = await admin
    .from("deposits")
    .select("id, status")
    .eq("stripe_session_id", session.id)
    .maybeSingle();

  if (existing?.status === "completed") {
    return NextResponse.json({ received: true, note: "Already processed." });
  }

  await admin.from("deposits").upsert(
    {
      user_id: userId,
      stripe_session_id: session.id,
      amount_cents: session.amount_total ?? 0,
      currency: session.currency ?? "eur",
      status: "completed",
      live_mode: PAYMENTS_LIVE_MODE,
    },
    { onConflict: "stripe_session_id" }
  );

  if (kind === "deposit") {
    if (PAYMENTS_LIVE_MODE) {
      const { data: wallet } = await admin
        .from("wallets")
        .select("live_balance_cents")
        .eq("user_id", userId)
        .maybeSingle();

      await admin
        .from("wallets")
        .update({
          live_balance_cents: (wallet?.live_balance_cents ?? 0) + (session.amount_total ?? 0),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } else {
      // Deliberately not crediting the ledger — see the file header comment.
      console.log(
        `[stripe webhook] Deposit ${session.id} completed but PAYMENTS_LIVE_MODE is false — ` +
          "ledger not credited. This is expected until custody/licensing is resolved."
      );
    }
  }

  if (kind === "subscription") {
    await admin.from("profiles").update({ tier: "pro" }).eq("id", userId);
  }

  return NextResponse.json({ received: true });
}
