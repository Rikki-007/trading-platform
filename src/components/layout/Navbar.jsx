"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, Wallet, User, LogOut } from "lucide-react";
import { useMarket } from "@/lib/MarketProvider";
import { formatCurrency } from "@/lib/market";
import { signOut } from "@/lib/auth/actions";
import { useAppReveal } from "@/lib/AppReveal";

const LINKS = [
  { href: "/markets", label: "Markets" },
  { href: "/trade", label: "Trade" },
  { href: "/training", label: "Training" },
  { href: "/live", label: "Live" },
];

export default function Navbar() {
  const { equity } = useMarket();
  const { ready } = useAppReveal();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [me, setMe] = useState(undefined); // undefined = loading, null = signed out

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((data) => setMe(data.user))
      .catch(() => setMe(null));
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={ready ? { y: 0, opacity: 1 } : { y: -24, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "bg-void/70 backdrop-blur-md border-b border-hairline" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full border border-hairline-strong bg-navy/60 text-gold transition-colors group-hover:border-gold/50">
            <Compass className="h-4 w-4" strokeWidth={1.75} />
            <span className="absolute inset-0 rounded-full bg-gold/10 blur-md" />
          </span>
          <span className="font-display text-[13px] leading-none tracking-[0.14em] text-porcelain sm:text-[14px]">
            LODESTAR MERIDIAN
            <span className="ml-1.5 hidden text-gold sm:inline">EXCHANGE</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-hairline bg-navy/40 p-1 backdrop-blur-sm md:flex">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                  isActive ? "bg-navy-light text-porcelain" : "text-mist hover:bg-navy-light hover:text-porcelain"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
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

          {me ? (
            <form action={signOut}>
              <button
                type="submit"
                title={me.email}
                className="flex items-center gap-1.5 rounded-full border border-hairline bg-navy/50 px-3 py-1.5 text-xs text-mist transition-colors hover:text-porcelain"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          ) : me === null ? (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-hairline bg-navy/50 px-3 py-1.5 text-xs text-mist transition-colors hover:text-porcelain"
            >
              <User className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Sign in</span>
            </Link>
          ) : null}
        </div>
      </div>
    </motion.header>
  );
}
