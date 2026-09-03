import { redirect } from "next/navigation";

/**
 * The $100,000 practice account (portfolio, positions, fill history) moved
 * to /virtual-trading, consolidated with the instrument picker and order
 * execution into one unified practice-trading page — see
 * src/app/virtual-trading/page.js. This redirect exists so an old bookmark
 * or link still lands somewhere real.
 */
export default function TrainingPage() {
  redirect("/virtual-trading");
}
