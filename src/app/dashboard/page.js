import Link from "next/link";
import { TrendingUp, ArrowLeftRight, GraduationCap, Video, Headset, ArrowUpRight } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";
import BroadcastFeed from "@/components/notifications/BroadcastFeed";

export const metadata = { title: "Dashboard — Lodestar Meridian Exchange" };

const QUICK_LINKS = [
  {
    href: "/markets",
    label: "Markets",
    icon: TrendingUp,
    description: "Browse instruments and live-feeling charts.",
  },
  {
    href: "/trade",
    label: "Trade",
    icon: ArrowLeftRight,
    description: "Execute a simulated order against your practice capital.",
  },
  {
    href: "/training",
    label: "Training",
    icon: GraduationCap,
    description: "Your $100,000 practice account, portfolio, and fill history.",
  },
  {
    href: "/meeting",
    label: "Online Meeting",
    icon: Video,
    description: "Book or join a 1:1 video consultation with an admin.",
  },
  {
    href: "/coaching",
    label: "Train with Expert",
    icon: Headset,
    description: "Live-trade alongside an admin-hosted coaching session.",
  },
];

/**
 * The signed-in home base — an overview and a set of quick links into the
 * actual modules, not a duplicate of any one of them. The $100,000 practice
 * account itself (portfolio, positions, fill history) lives entirely on
 * /training; this page just points to it, same as it points to every other
 * module, so nothing about the practice capital is tracked in two places.
 */
export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Dashboard"
        title="Your home base"
        description="Everything on Meridian starts here — jump into practice trading, browse markets, or connect with an expert."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map(({ href, label, icon: Icon, description }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col rounded-2xl border border-hairline bg-navy/50 p-5 backdrop-blur-md transition-colors hover:border-hairline-strong hover:bg-navy-light/40"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-hairline-strong bg-void-deep/50 text-cyan">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <span className="mt-3 text-sm font-semibold text-porcelain">{label}</span>
            <span className="mt-1 text-xs leading-relaxed text-mist">{description}</span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-cyan opacity-0 transition-opacity group-hover:opacity-100">
              Open
              <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-16">
        <SectionHeading
          eyebrow="Pulse"
          title="Recent broadcasts"
          description="Notify-only trade broadcasts from admin-hosted sessions — nothing here auto-replicates into your account."
        />
        <BroadcastFeed />
      </div>
    </div>
  );
}
