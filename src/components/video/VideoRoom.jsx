"use client";

import { useEffect, useRef } from "react";

/**
 * Embeds a Daily.co call in an iframe. `url` is the room's full join URL,
 * `token` is the meeting token issued by /api/video/rooms or
 * /api/video/join (scopes the participant into that specific room with the
 * right owner/guest privileges).
 */
export default function VideoRoom({ url, token, onLeave }) {
  const containerRef = useRef(null);
  const callFrameRef = useRef(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    let cancelled = false;

    import("@daily-co/daily-js").then(({ default: DailyIframe }) => {
      if (cancelled || !containerRef.current) return;

      const frame = DailyIframe.createFrame(containerRef.current, {
        iframeStyle: {
          width: "100%",
          height: "100%",
          border: "0",
          borderRadius: "12px",
        },
        showLeaveButton: true,
      });

      frame.on("left-meeting", () => onLeave?.());
      frame.join({ url, token });
      callFrameRef.current = frame;
    });

    return () => {
      cancelled = true;
      callFrameRef.current?.destroy();
      callFrameRef.current = null;
    };
  }, [url, token, onLeave]);

  return (
    <div
      ref={containerRef}
      className="aspect-video w-full overflow-hidden rounded-xl border border-hairline bg-void-deep"
    />
  );
}
