import { NextResponse } from "next/server";
import { getPolygonQuotes } from "@/lib/market/polygon";
import { LIVE_INSTRUMENTS } from "@/lib/market/liveInstruments";

/**
 * GET /api/market/quotes — proxies Polygon.io so the API key never reaches
 * the browser. Returns { configured: false } (not an error) when
 * POLYGON_API_KEY isn't set, so the client can render a clear "not
 * connected" state instead of a broken one.
 */
export async function GET() {
  const apiKey = process.env.POLYGON_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ configured: false, quotes: [] });
  }

  try {
    const quotes = await getPolygonQuotes(LIVE_INSTRUMENTS, apiKey);
    return NextResponse.json({ configured: true, quotes, fetchedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { configured: true, quotes: [], error: err.message || "Failed to fetch quotes." },
      { status: 502 }
    );
  }
}
