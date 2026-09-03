"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motionVariants";
import MicroTilt from "@/components/motion/MicroTilt";

/**
 * Shared section header, used at the top of every page (previously a
 * function defined inline in the old single-page page.js — now that each
 * section is its own route, it needed a real home so every page could
 * import the same one).
 */
export default function SectionHeading({ eyebrow, title, description }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      variants={fadeUp}
      className="mb-8 max-w-2xl"
    >
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">{eyebrow}</span>
      <MicroTilt strength={3} className="mt-2 inline-block">
        <h2 className="font-display text-2xl tracking-wide text-porcelain sm:text-3xl">{title}</h2>
      </MicroTilt>
      {description && <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>}
    </motion.div>
  );
}
