import { getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Validates and redeems a promo code for `userId`. Runs entirely against
 * the service-role client because it touches tables (`wallets`, and
 * `profiles.tier`) that regular users can't write to directly — the caller
 * (the API route) is responsible for establishing `userId` from a verified
 * session, never from client-supplied input.
 *
 * Returns { ok: true, ... } or { ok: false, reason }.
 */
export async function redeemPromoCode({ userId, code }) {
  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "Promo codes aren't configured yet." };

  const normalized = String(code || "").trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Enter a code." };

  const { data: promo, error: promoError } = await admin
    .from("promo_codes")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (promoError) return { ok: false, reason: "Couldn't look up that code. Try again." };
  if (!promo || !promo.active) return { ok: false, reason: "That code isn't valid." };
  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    return { ok: false, reason: "That code has expired." };
  }
  if (promo.max_redemptions !== null && promo.redemption_count >= promo.max_redemptions) {
    return { ok: false, reason: "That code has reached its redemption limit." };
  }

  // The unique(user_id, code) constraint on promo_redemptions is the real
  // guard against double-redeeming — this insert either succeeds once or
  // fails with a conflict, which we treat as "already redeemed" rather than
  // a hard error.
  const { error: redeemError } = await admin
    .from("promo_redemptions")
    .insert({ user_id: userId, code: normalized });

  if (redeemError) {
    if (redeemError.code === "23505") {
      return { ok: false, reason: "You've already redeemed this code." };
    }
    return { ok: false, reason: "Couldn't redeem that code. Try again." };
  }

  if (promo.bonus_practice_cents > 0) {
    const { data: wallet } = await admin
      .from("wallets")
      .select("practice_balance_cents")
      .eq("user_id", userId)
      .maybeSingle();

    await admin
      .from("wallets")
      .update({
        practice_balance_cents:
          (wallet?.practice_balance_cents ?? 0) + promo.bonus_practice_cents,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }

  if (promo.grants_tier) {
    await admin.from("profiles").update({ tier: promo.grants_tier }).eq("id", userId);
  }

  await admin
    .from("promo_codes")
    .update({ redemption_count: promo.redemption_count + 1 })
    .eq("code", normalized);

  return {
    ok: true,
    bonusPracticeCents: promo.bonus_practice_cents,
    grantsTier: promo.grants_tier,
  };
}
