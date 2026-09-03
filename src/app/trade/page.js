import { redirect } from "next/navigation";

/**
 * Order execution moved to /virtual-trading, consolidated with the
 * instrument picker and portfolio into one unified practice-trading page —
 * see src/app/virtual-trading/page.js. This redirect exists so an old
 * bookmark or link still lands somewhere real.
 */
export default function TradePage() {
  redirect("/virtual-trading");
}
