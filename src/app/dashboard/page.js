import { redirect } from "next/navigation";

/**
 * The overview-cards + Recent Broadcasts view that used to live here was a
 * second, redundant "dashboard" competing with the real one — the hero and
 * 4 feature cards on "/" already are Meridian's main dashboard, and the
 * navbar's "Main Dashboard" tab points straight at "/" now. This redirect
 * exists purely so an old bookmark or link to /dashboard still lands
 * somewhere real instead of a 404.
 */
export default function DashboardPage() {
  redirect("/");
}
