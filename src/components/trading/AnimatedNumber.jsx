"use client";

import { useEffect, useState } from "react";
import { useSpring } from "framer-motion";

/**
 * Smoothly tweens a displayed number toward `value` on every change instead
 * of snapping — the small motion is what makes a live equity/P&L readout
 * feel like a real terminal instead of a static label that occasionally
 * flickers.
 */
export default function AnimatedNumber({ value, format = (v) => v.toFixed(2), className }) {
  const spring = useSpring(value, { stiffness: 120, damping: 22, mass: 0.6 });
  const [display, setDisplay] = useState(() => format(value));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v) => setDisplay(format(v)));
    return unsubscribe;
  }, [spring, format]);

  return <span className={className}>{display}</span>;
}
