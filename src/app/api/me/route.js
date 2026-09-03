import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GET /api/me — the current user's profile + wallet, or { user: null } when
 * signed out / auth isn't configured. The one place client components go to
 * find out who's signed in and whether they're an admin, since the rest of
 * this app's pages are Client Components (the existing page.js predates
 * auth and owns client-side state for symbol selection etc.) rather than
 * Server Components that could read the session directly.
 */
export async function GET() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ user: null });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ user: null });

  const { data: profile } = await supabase
    .from("profiles")
    .select("tier, is_admin, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const { data: wallet } = await supabase
    .from("wallets")
    .select("practice_balance_cents, live_balance_cents, live_currency")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: profile || null,
    wallet: wallet || null,
  });
}
