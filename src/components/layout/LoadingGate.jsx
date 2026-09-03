"use client";

import LoadingScreen from "@/components/loading/LoadingScreen";
import { useAppReveal } from "@/lib/AppReveal";

/** Thin bridge: tells AppRevealProvider the moment the loader starts its
 * exit, so every other entrance animation (navbar, sidebar, hero) can start
 * at that exact instant instead of firing independently on mount. */
export default function LoadingGate() {
  const { setReady } = useAppReveal();
  return <LoadingScreen onExitStart={() => setReady(true)} />;
}
