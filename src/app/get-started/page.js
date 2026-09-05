import { Coins, TrendingUp, Bitcoin, MessagesSquare, Star, Send } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";
import { CONTACT_INFO } from "@/lib/contact/info";

export const metadata = { title: "Get Started — Lodestar Meridian Exchange" };

/**
 * Placeholder copy throughout this file — written to read as real,
 * professional community copy rather than lorem ipsum, but every
 * description/name here is a stand-in. Swap the `description` (and
 * `featured` flags) for the client's actual channel copy; nothing else in
 * the page needs to change to support it.
 *
 * "Join" links route through mailto: rather than a dead "#" — there's no
 * real invite link yet, but a mailto with a pre-filled subject is a
 * genuinely working request path today, not a placeholder that silently
 * does nothing when clicked. Swap `mailtoHref` for a real Telegram/Discord
 * invite link once the client provides one.
 */
const CHANNELS = [
  {
    id: "goldmine",
    icon: Coins,
    name: "Goldmine",
    tagline: "Gold buying & selling signals",
    description:
      "Focused entirely on gold — entries, exits, and the reasoning behind them, shared as they happen. The most active channel in the community.",
    featured: true,
  },
  {
    id: "trading-floor",
    icon: MessagesSquare,
    name: "Trading Floor",
    tagline: "General discussion",
    description:
      "The main room — market chatter, questions, wins and losses, and everything that doesn't fit a dedicated channel.",
    featured: false,
  },
  {
    id: "fx-pulse",
    icon: TrendingUp,
    name: "FX Pulse",
    tagline: "Forex signals & analysis",
    description: "Currency pair setups and macro discussion for members focused on forex.",
    featured: false,
  },
  {
    id: "crypto-corner",
    icon: Bitcoin,
    name: "Crypto Corner",
    tagline: "Crypto signals & discussion",
    description: "Spot and derivatives discussion across major crypto assets, plus on-chain talk.",
    featured: false,
  },
];

function mailtoHref(channelName) {
  const subject = encodeURIComponent(`Access request — ${channelName}`);
  const body = encodeURIComponent(
    `Hi Meridian team,\n\nI'd like to join the "${channelName}" community group chat.\n\nThanks!`
  );
  return `mailto:${CONTACT_INFO.communityEmail}?subject=${subject}&body=${body}`;
}

export default function GetStartedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Get Started"
        title="Join the Meridian community"
        description="Group chats organized by focus, so you only see the signal relevant to you. Request access below — an invite lands in your inbox from a real person, not a bot."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CHANNELS.map(({ id, icon: Icon, name, tagline, description, featured }) => (
          <div
            key={id}
            className={`relative flex flex-col rounded-2xl border p-5 backdrop-blur-md ${
              featured
                ? "border-gold/30 bg-gradient-to-b from-gold/[0.07] to-navy/50"
                : "border-hairline bg-navy/50"
            }`}
          >
            {featured && (
              <span className="absolute right-5 top-5 flex items-center gap-1 rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
                <Star className="h-2.5 w-2.5" strokeWidth={2} />
                Most active
              </span>
            )}
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                featured ? "border-gold/30 bg-void-deep/50 text-gold" : "border-hairline-strong bg-void-deep/50 text-cyan"
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <h3 className="mt-3 font-display text-lg text-porcelain">{name}</h3>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-mist-dim">{tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-mist">{description}</p>
            <a
              href={mailtoHref(name)}
              className="mt-5 inline-flex items-center justify-center gap-1.5 self-start rounded-full border border-hairline-strong bg-void-deep/40 px-4 py-2 text-xs font-medium text-porcelain transition-colors hover:bg-navy-light"
            >
              <Send className="h-3 w-3" strokeWidth={2} />
              Request access
            </a>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-mist-dim">
        Prefer to talk first? Reach the team directly at{" "}
        <a href={`mailto:${CONTACT_INFO.supportEmail}`} className="text-cyan hover:underline">
          {CONTACT_INFO.supportEmail}
        </a>{" "}
        or see <a href="/mentorship" className="text-cyan hover:underline">Mentorship</a> to book time
        with an expert.
      </p>
    </div>
  );
}
