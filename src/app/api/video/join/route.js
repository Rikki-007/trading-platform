import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { createDailyMeetingToken } from "@/lib/video/daily";

/**
 * POST /api/video/join — issues a non-owner meeting token for any signed-in
 * user to join a room that already exists (created via /api/video/rooms).
 * Requires knowing the exact room name, which the admin shares with the
 * invited client(s) — this route doesn't expose a list of open rooms.
 */
export async function POST(request) {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, reason: "Video isn't configured yet." }, { status: 503 });
  }

  const supabase = await getSupabaseServerClient();
  const admin = getSupabaseAdminClient();
  if (!supabase || !admin) {
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

  const roomName = String(body?.roomName || "").trim();
  if (!roomName) {
    return NextResponse.json({ ok: false, reason: "Missing room name." }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const token = await createDailyMeetingToken({
      apiKey,
      roomName,
      userName: profile?.display_name || profile?.email || "Guest",
      isOwner: false,
    });
    return NextResponse.json({ ok: true, token });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: err.message }, { status: 502 });
  }
}
