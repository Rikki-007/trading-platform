"use client";

import dynamic from "next/dynamic";
import { MarketProvider } from "@/lib/MarketProvider";
import { SelectionProvider } from "@/lib/SelectionProvider";
import { AppRevealProvider } from "@/lib/AppReveal";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";

// Three.js touches `window` on import, and a WebGL context has nothing to
// render on the server anyway — load the whole scene client-only.
const OnePieceTradingCanvas = dynamic(() => import("@/components/canvas/OnePieceTradingCanvas"), {
  ssr: false,
});

// LoadingGate -> LoadingScreen reads window.matchMedia synchronously on
// first render. Marking those files "use client" only draws the
// server/client bundle boundary — Next.js still server-renders client
// components for the initial HTML unless the *import site* is wrapped in
// dynamic(..., { ssr: false }), which is what actually skips that. This is
// the same fix as the canvas above, just needed here too since AppShell now
// lives in the root layout and renders on every route, including
// Next.js's own generated /_not-found page.
const LoadingGate = dynamic(() => import("@/components/layout/LoadingGate"), {
  ssr: false,
});

/**
 * Everything that used to live inline in the old single-page page.js, now
 * hoisted into the root layout so it persists across route navigations
 * instead of remounting on every click — the 3D canvas keeps its WebGL
 * context, the loading screen shows exactly once per app load (not once per
 * page), and MarketProvider/SelectionProvider stay alive so state survives
 * moving between /dashboard, /markets, /trade, etc.
 */
export default function AppShell({ children }) {
  return (
    <MarketProvider>
      <SelectionProvider>
        <AppRevealProvider>
          <LoadingGate />
          <OnePieceTradingCanvas />
          <Navbar />
          <Sidebar />
          <main className="relative z-10">{children}</main>
          <Footer />
        </AppRevealProvider>
      </SelectionProvider>
    </MarketProvider>
  );
}
