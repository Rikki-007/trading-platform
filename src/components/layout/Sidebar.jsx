"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, TrendingUp, ArrowLeftRight, History } from "lucide-react";

const ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "markets", label: "Markets", icon: TrendingUp },
  { id: "trade", label: "Trade", icon: ArrowLeftRight },
  { id: "activity", label: "Activity", icon: History },
];

export default function Sidebar() {
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    const sections = ITEMS.map((item) => document.getElementById(item.id)).filter(Boolean);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      className="fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      aria-label="Section navigation"
    >
      <nav className="flex flex-col items-center gap-1 rounded-2xl border border-hairline bg-navy/50 p-2 backdrop-blur-md">
        {ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              aria-label={label}
              aria-current={isActive ? "true" : undefined}
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
            </a>
          );
        })}
      </nav>
    </motion.aside>
  );
}
