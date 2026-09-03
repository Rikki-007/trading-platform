import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redeemPromoCode } from "@/lib/promo/redeemPromoCode";

export async function POST(request) {
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
    return NextResponse.json({ ok: false, reason: "Invalid request." }, { status: 400 });
  }

  const result = await redeemPromoCode({ userId: user.id, code: body?.code });
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
