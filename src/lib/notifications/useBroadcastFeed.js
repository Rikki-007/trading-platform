"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Subscribes to new rows on `broadcasts` via Supabase Realtime, plus an
 * initial fetch of recent ones. Requires the viewer to be signed in (the
 * table's RLS policy is `to authenticated`) — returns an empty, static list
 * when there's no session or Supabase isn't configured, rather than
 * erroring.
 */
export function useBroadcastFeed({ limit = 20 } = {}) {
  const [broadcasts, setBroadcasts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let cancelled = false;

    supabase
      .from("broadcasts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => {
        if (!cancelled && data) setBroadcasts(data);
      });

    const channel = supabase
      .channel("broadcasts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "broadcasts" },
        (payload) => {
          setBroadcasts((prev) => [payload.new, ...prev].slice(0, limit));
        }
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [limit]);

  return { broadcasts, connected };
}
