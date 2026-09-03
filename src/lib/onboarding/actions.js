"use server";

import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * Sets the caller's account tier. Runs through the admin client because the
 * `protect_profile_privileges` trigger (see supabase/migrations/0001_init.sql)
 * deliberately blocks tier changes from the regular, session-scoped client —
 * this server action is the one legitimate path around that, gated on a
 * verified session rather than trusting client input.
 */
export async function setAccountTier(tier) {
  if (tier !== "standard" && tier !== "pro") {
    return { ok: false, reason: "Invalid tier." };
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, reason: "Auth isn't configured." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: "Sign in first." };

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, reason: "Auth isn't configured." };

  const { error } = await admin.from("profiles").update({ tier }).eq("id", user.id);
  if (error) return { ok: false, reason: "Couldn't update your account. Try again." };

  return { ok: true };
}
