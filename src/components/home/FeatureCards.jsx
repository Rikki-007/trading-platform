"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp, GraduationCap, Headset, Video, ArrowUpRight } from "lucide-react";

const FEATURES = [
  {
    id: "live-trading",
    icon: TrendingUp,
    title: "Live Trading",
    subtitle: "Paper & funded market simulation",
    description:
      "Practice with $100,000 in mock capital today, or step into the funded tier once you're ready to go live.",
    cta: "Enter the terminal",
    href: "/virtual-trading",
  },
  {
    id: "training",
    icon: GraduationCap,
    title: "Training",
    subtitle: "Tutorials & strategy guides",
    description:
      "Structured lessons and strategy walkthroughs for every experience level — in active development.",
    cta: "See what's coming",
    href: "/virtual-trading",
  },
  {
    id: "call-expert",
    icon: Headset,
    title: "Call the Expert",
    subtitle: "Direct support & consultation booking",
    description:
      "Book a private session with an admin to walk through strategy, or get hands-on help with your account.",
    cta: "Request a call",
    href: "/mentorship",
  },
  {
    id: "video-call",
    icon: Video,
    title: "Video Call",
    subtitle: "Integrated consulting rooms",
    description:
      "Join a live video room straight from your dashboard — no separate app, no extra login.",
    cta: "Join a room",
    href: "/mentorship",
  },
];

const TILT_RANGE = 10; // degrees

function TiltCard({ icon: Icon, title, subtitle, description, cta, href, index }) {
  const cardRef = useRef(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { stiffness: 220, damping: 20, mass: 0.4 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [0, 1], [TILT_RANGE, -TILT_RANGE]);
  const rotateY = useTransform(smoothX, [0, 1], [-TILT_RANGE, TILT_RANGE]);
  const glowX = useTransform(smoothX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(smoothY, [0, 1], ["0%", "100%"]);
  const glowBackground = useTransform(
    [glowX, glowY],
    ([x, y]) =>
      `radial-gradient(240px circle at ${x} ${y}, rgba(0,240,255,0.16), rgba(245,158,11,0.08) 45%, transparent 70%)`
  );

  function handleMouseMove(e) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  return (
    <motion.a
      href={href}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.08 }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="group relative block overflow-hidden rounded-3xl border border-hairline-strong/60 bg-gradient-to-b from-navy-light/60 to-navy/40 p-6 backdrop-blur-xl [transform-style:preserve-3d]"
    >
      {/* water-glass sheen that tracks the cursor */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glowBackground }}
      />
      {/* static top highlight, like light through water */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-3xl bg-gradient-to-b from-white/[0.06] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/[0.04]"
      />

      <div className="relative" style={{ transform: "translateZ(40px)" }}>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-hairline-strong bg-void-deep/50 text-cyan">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <h3 className="mt-4 font-display text-lg text-porcelain">{title}</h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-gold">{subtitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-cyan">
          {cta}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2} />
        </span>
      </div>
    </motion.a>
  );
}

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature, index) => (
          <TiltCard key={feature.id} index={index} {...feature} />
        ))}
      </div>
    </section>
  );
}
