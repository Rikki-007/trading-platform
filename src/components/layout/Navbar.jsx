"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Compass, Wallet } from "lucide-react";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency } from "@/lib/market";

const LINKS = [
  { href: "#dashboard", label: "Dashboard" },
  { href: "#markets", label: "Markets" },
  { href: "#trade", label: "Trade" },
];

export default function Navbar() {
  const { equity } = useMarket();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-void/70 backdrop-blur-md border-b border-hairline" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#hero" className="flex items-center gap-2.5 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-hairline-strong bg-navy/60 text-gold transition-colors group-hover:border-gold/50">
            <Compass className="h-4 w-4" strokeWidth={1.75} />
            <span className="absolute inset-0 rounded-full bg-gold/10 blur-md" />
          </span>
          <span className="font-display text-[15px] tracking-[0.16em] text-porcelain">
            MERIDIAN
          </span>
        </a>

        <nav className="hidden items-center gap-1 rounded-full border border-hairline bg-navy/40 p-1 backdrop-blur-sm md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-1.5 text-sm text-mist transition-colors hover:bg-navy-light hover:text-porcelain"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-gold sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-slow" />
            Paper mode
          </span>
          <div className="flex items-center gap-2 rounded-full border border-hairline bg-navy/50 px-3 py-1.5 text-sm">
            <Wallet className="h-3.5 w-3.5 text-mist" strokeWidth={1.75} />
            <span className="font-mono font-variant-tabular text-porcelain">
              {formatCurrency(equity, { compact: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
