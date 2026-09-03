import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * POST /api/broadcast — admin-only. Inserts a row into `broadcasts`, which
 * every signed-in client is subscribed to via Supabase Realtime (see
 * useBroadcastFeed.js). This is NOTIFY-ONLY: it announces that a trade
 * happened. It never places an order in anyone else's account — see
 * MERIDIAN_PHASE2_REPORT.md Section 3.3 for exactly why that line matters
 * (auto-replicating this into follower accounts would legally be "portfolio
 * management" under EU MiFID II and require a license this platform
 * doesn't have).
 */
export async function POST(request) {
  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) {
    return NextResponse.json({ ok: false, reason: "Not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, reason: "Sign in first." }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return NextResponse.json({ ok: false, reason: "Only admins can broadcast a trade." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Invalid request." }, { status: 400 });
  }

  const { symbol, side, qty, priceCents, note } = body || {};
  if (!symbol || (side !== "buy" && side !== "sell") || !(qty > 0) || !(priceCents > 0)) {
    return NextResponse.json({ ok: false, reason: "Missing or invalid trade details." }, { status: 400 });
  }

  const { error } = await admin.from("broadcasts").insert({
    created_by: user.id,
    symbol: String(symbol).toUpperCase(),
    side,
    qty,
    price_cents: Math.round(priceCents),
    note: note ? String(note).slice(0, 280) : null,
  });

  if (error) {
    return NextResponse.json({ ok: false, reason: "Couldn't post the broadcast." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
