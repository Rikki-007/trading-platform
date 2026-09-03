"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Gentle, whole-viewport-driven tilt/shift for text and UI wrappers —
 * distinct from FeatureCards' per-card tilt (which tracks the cursor
 * relative to that one card's bounds). This tracks the cursor's position in
 * the *viewport*, so headings and wrappers scattered across a page all
 * drift together, consistently, as one subtle depth cue rather than each
 * fighting for the cursor's attention independently.
 *
 * `strength` is in degrees of rotation (translation is derived from it, at
 * a smaller scale) — keep this small; it's meant to be felt, not seen.
 */
export default function MicroTilt({ children, strength = 5, className, as = "div" }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springConfig = { stiffness: 50, damping: 18, mass: 0.7 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const rotateX = useTransform(springY, [0, 1], [strength, -strength]);
  const rotateY = useTransform(springX, [0, 1], [-strength, strength]);
  const translateX = useTransform(springX, [0, 1], [-strength * 0.5, strength * 0.5]);
  const translateY = useTransform(springY, [0, 1], [-strength * 0.5, strength * 0.5]);

  useEffect(() => {
    function handlePointerMove(e) {
      x.set(e.clientX / window.innerWidth);
      y.set(e.clientY / window.innerHeight);
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [x, y]);

  const MotionTag = motion[as] ?? motion.div;

  return (
    <MotionTag
      className={className}
      style={{ rotateX, rotateY, x: translateX, y: translateY, transformPerspective: 700 }}
    >
      {children}
    </MotionTag>
  );
}
