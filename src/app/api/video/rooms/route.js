import { NextResponse } from "next/server";
import { getSupabaseServerClient, getSupabaseAdminClient } from "@/lib/supabase/server";
import { createDailyRoom, createDailyMeetingToken } from "@/lib/video/daily";

/**
 * POST /api/video/rooms — creates a new video room. Admin-only (checked
 * against `profiles.is_admin`, granted manually in the Supabase dashboard —
 * see supabase/migrations/0001_init.sql). Returns an owner-level meeting
 * token so the admin who created it gets host controls.
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

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin, display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return NextResponse.json({ ok: false, reason: "Only admins can start a room." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const kind = body?.kind === "live-room" ? "live-room" : "consultation";
  const roomName = `meridian-${kind}-${Date.now().toString(36)}`;

  try {
    const room = await createDailyRoom({
      apiKey,
      name: roomName,
      properties: kind === "consultation" ? { max_participants: 2 } : {},
    });

    const token = await createDailyMeetingToken({
      apiKey,
      roomName: room.name,
      userName: profile.display_name || profile.email || "Host",
      isOwner: true,
    });

    return NextResponse.json({ ok: true, roomName: room.name, url: room.url, token });
  } catch (err) {
    return NextResponse.json({ ok: false, reason: err.message }, { status: 502 });
  }
}
