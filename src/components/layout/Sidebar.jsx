"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Radio, LineChart, History, Headset } from "lucide-react";
import { useAppReveal } from "@/lib/AppReveal";

const ITEMS = [
  // Same "/" as the navbar's Main Dashboard tab — see the comment there.
  { href: "/", label: "Main Dashboard", icon: LayoutDashboard },
  { href: "/live-trading", label: "Live Trading", icon: Radio },
  { href: "/virtual-trading", label: "Virtual Trading", icon: LineChart },
  // Activity lives on the Virtual Trading page (see
  // src/app/virtual-trading/page.js), next to the practice account itself
  // — this deep-links straight to it rather than getting its own route,
  // since "your account state" and "your recent fills" are the same
  // concern.
  { href: "/virtual-trading#activity", label: "Activity", icon: History, matchPath: "/virtual-trading" },
  { href: "/mentorship", label: "Mentorship", icon: Headset },
];

/**
 * Was scroll-spy (IntersectionObserver watching section ids) back when
 * every section lived on one page. Now that each is its own route, "active"
 * just means "the current path" — usePathname replaces the observer
 * entirely, and is simpler besides.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { ready } = useAppReveal();

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={ready ? { x: 0, opacity: 1 } : { x: -24, opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: ready ? 0.1 : 0 }}
      className="fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      aria-label="Section navigation"
    >
      <nav className="flex flex-col items-center gap-1 rounded-2xl border border-hairline bg-navy/50 p-2 backdrop-blur-md">
        {ITEMS.map(({ href, label, icon: Icon, matchPath }) => {
          const isActive = pathname === (matchPath ?? href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-cyan/12 border border-cyan/30"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                className={`relative h-4 w-4 transition-colors ${
                  isActive ? "text-cyan" : "text-mist group-hover:text-porcelain"
                }`}
                strokeWidth={1.75}
              />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border border-hairline bg-navy px-2.5 py-1 text-xs text-porcelain opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
