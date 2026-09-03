"use client";

import { createContext, useContext, useState } from "react";

const AppRevealContext = createContext(null);

/**
 * Coordinates the loading screen's exit with every other entrance animation
 * in the app (navbar, sidebar, hero) so they play as one choreographed
 * reveal instead of firing independently on mount — which is what made the
 * old loader-to-home cut feel abrupt: the hero had already finished
 * animating in *underneath* the loader before the loader ever faded.
 *
 * `ready` flips to true the moment the loading screen *starts* its exit
 * (not after it finishes) — see LoadingGate.jsx — so the incoming content
 * animates in concurrently with the loader fading out, a genuine cross-
 * dissolve rather than two animations running back to back.
 */
export function AppRevealProvider({ children }) {
  const [ready, setReady] = useState(false);
  return (
    <AppRevealContext.Provider value={{ ready, setReady }}>{children}</AppRevealContext.Provider>
  );
}

export function useAppReveal() {
  const ctx = useContext(AppRevealContext);
  // Falls back to "already ready" rather than throwing — any component that
  // renders outside AppShell's provider (unlikely, but cheap to guard)
  // should just animate in normally instead of hanging forever.
  return ctx ?? { ready: true, setReady: () => {} };
}
