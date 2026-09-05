"use client";

import { motion } from "framer-motion";
import { Compass, Users, GraduationCap, ArrowRight } from "lucide-react";
import { fadeUp } from "@/lib/motionVariants";

const PATHS = [
  {
    icon: Compass,
    title: "Practice free",
    description: "Start on Virtual Trading with a full practice balance — no signup friction, no risk.",
    href: "/virtual-trading",
    cta: "Enter the terminal",
  },
  {
    icon: Users,
    title: "Join the community",
    description: "Group chats for every corner of the market, from signals to general discussion.",
    href: "/get-started",
    cta: "See the community",
  },
  {
    icon: GraduationCap,
    title: "Learn from the team",
    description: "Book a 1:1 consultation or sit in on a live-hosted trading room with an expert.",
    href: "/mentorship",
    cta: "Meet the team",
  },
];

/**
 * The mission statement + "how do I actually get involved" section that
 * sits below the 4 feature cards on the home page. Those cards sell what
 * each module *does*; this section is the shorter, plainer answer to "what
 * is this and how do I join in" that a first-time visitor still needs
 * after scrolling past the cards.
 */
export default function MissionSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Our mission</span>
        <h2 className="mt-2 font-display text-2xl tracking-wide text-porcelain sm:text-3xl">
          Trading education shouldn&rsquo;t cost you your first mistake
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-mist">
          Meridian exists to put a real terminal, a real community, and real mentorship in front of
          anyone learning to trade — before a single dollar of theirs is at risk. Practice against a
          live-feeling market, ask questions in the community, and get direct time with people who
          trade for a living. That&rsquo;s the whole model.
        </p>
      </motion.div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PATHS.map(({ icon: Icon, title, description, href, cta }, index) => (
          <motion.a
            key={href}
            href={href}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.08 }}
            className="group flex flex-col rounded-2xl border border-hairline bg-navy/50 p-5 backdrop-blur-md transition-colors hover:border-hairline-strong hover:bg-navy-light/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-hairline-strong bg-void-deep/50 text-cyan">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-porcelain">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-mist">{description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cyan">
              {cta}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
