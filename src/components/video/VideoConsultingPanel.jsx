"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Video, Loader2, LogIn } from "lucide-react";
import VideoRoom from "./VideoRoom";

/**
 * Admin side: start a new consultation or live-trading room.
 * Everyone else: join a room by name (an admin shares the name out of band —
 * e.g. in a scheduled-session confirmation, once a scheduling flow exists).
 *
 * Admin status is self-fetched from /api/me (server-verified there against
 * profiles.is_admin) rather than trusted from a prop — this component can
 * be dropped anywhere without a server-component parent to feed it one.
 */
export default function VideoConsultingPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(null); // { url, token }
  const [joinRoomName, setJoinRoomName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setIsAdmin(Boolean(data?.profile?.is_admin)))
      .catch(() => {});
  }, []);

  async function startRoom(kind) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/video/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.reason);
      setSession({ url: data.url, token: data.token, roomName: data.roomName });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  async function joinRoom(e) {
    e.preventDefault();
    if (!joinRoomName.trim()) return;
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/video/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: joinRoomName.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.reason);
      const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN || "";
      setSession({ url: `${domain}/${joinRoomName.trim()}`, token: data.token });
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  if (session) {
    return <VideoRoom url={session.url} token={session.token} onLeave={() => setSession(null)} />;
  }

  return (
    <div className="rounded-2xl border border-hairline bg-navy/50 p-6 backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-hairline pb-3">
        <Video className="h-4 w-4 text-gold" strokeWidth={1.75} />
        <span className="text-xs uppercase tracking-wider text-mist">Video consulting</span>
      </div>

      {error && <p className="mt-3 text-xs text-crimson">{error}</p>}

      {isAdmin ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => startRoom("consultation")}
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan py-2.5 text-sm font-semibold text-void-deep disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start 1:1 consultation"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => startRoom("live-room")}
            disabled={pending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-hairline py-2.5 text-sm text-porcelain transition-colors hover:bg-navy-light disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start live trading room"}
          </motion.button>
        </div>
      ) : (
        <form onSubmit={joinRoom} className="mt-4 flex gap-2">
          <input
            value={joinRoomName}
            onChange={(e) => setJoinRoomName(e.target.value)}
            placeholder="Room name from your invite"
            className="flex-1 rounded-lg border border-hairline bg-void-deep/50 px-3 py-2 font-mono text-sm text-porcelain outline-none transition-colors focus:border-cyan/50"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={pending}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-void-deep disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" strokeWidth={2} />}
          </motion.button>
        </form>
      )}
    </div>
  );
}
