"use client";

import { Compass } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-hairline bg-void/60 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-mist">
          <Compass className="h-4 w-4 text-gold/70" strokeWidth={1.75} />
          <span className="font-display text-xs tracking-[0.14em] text-mist">MERIDIAN</span>
          <span className="text-hairline-strong">/</span>
          <span className="text-xs">Chart your own course.</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-mist-dim">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
          </span>
          Simulated market data — no real funds are traded on this platform.
        </div>
      </div>
    </footer>
  );
}
