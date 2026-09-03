import { redirect } from "next/navigation";

/**
 * /live has meant a few different things across earlier revisions of this
 * app (a catch-all page, then a consulting-focused one). Now that "Live
 * Trading" is an established nav tab with its own route, redirecting the
 * bare /live path there is the least surprising outcome for anyone who
 * still has it bookmarked — see src/app/live-trading/page.js.
 */
export default function LivePage() {
  redirect("/live-trading");
}
