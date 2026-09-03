"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MIN_DISPLAY_MS = 1500;

/**
 * A timed cinematic splash, not a true asset-readiness poll — tracking
 * "are the fonts/WebGL context/etc. actually ready" reliably across
 * browsers is its own rabbit hole, and a deliberate timed reveal is the
 * standard, honest way to do this class of loader. The app underneath is
 * already mounting during this window (see page.js), so by the time this
 * exits, the hero it reveals isn't still assembling itself.
 *
 * Respects prefers-reduced-motion by skipping straight past the animated
 * rings/wordmark reveal to a quick fade.
 */
export default function LoadingScreen({ onDone }) {
  const [visible, setVisible] = useState(true);
  // Lazy initializer reads the real value on first render — this component
  // is only ever rendered client-side, so `window` is always available here.
  const [reducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), reducedMotion ? 400 : MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: reducedMotion ? 0.3 : 0.6, ease: "easeInOut" }}
        >
          <div className="relative flex h-24 w-24 items-center justify-center">
            {[46, 32, 18].map((size, i) => (
              <motion.span
                key={size}
                className="absolute rounded-full border"
                style={{
                  width: size * 2,
                  height: size * 2,
                  borderColor: i === 1 ? "rgba(245,158,11,0.45)" : "rgba(0,240,255,0.35)",
                }}
                initial={{ opacity: 0, scale: 0.6, rotate: 0 }}
                animate={
                  reducedMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 1, scale: 1, rotate: i % 2 === 0 ? 360 : -360 }
                }
                transition={{
                  opacity: { duration: 0.5, delay: i * 0.12 },
                  scale: { duration: 0.5, delay: i * 0.12 },
                  rotate: { duration: 5 + i, repeat: Infinity, ease: "linear" },
                }}
              />
            ))}
            <motion.span
              className="h-2.5 w-2.5 rounded-full bg-gold"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: reducedMotion ? 1 : [1, 1.35, 1],
                boxShadow: [
                  "0 0 6px rgba(245,158,11,0.6)",
                  "0 0 16px rgba(245,158,11,0.9)",
                  "0 0 6px rgba(245,158,11,0.6)",
                ],
              }}
              transition={{ duration: 1.6, repeat: reducedMotion ? 0 : Infinity, ease: "easeInOut", delay: 0.3 }}
            />
          </div>

          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <div className="font-display text-sm tracking-[0.28em] text-porcelain sm:text-base">
              LODESTAR MERIDIAN
            </div>
            <div className="mt-1 font-display text-[10px] tracking-[0.5em] text-gold sm:text-xs">
              EXCHANGE
            </div>
          </motion.div>

          <motion.div
            className="mt-8 h-px w-32 overflow-hidden rounded-full bg-hairline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan to-transparent"
              animate={{ x: ["-120%", "220%"] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
