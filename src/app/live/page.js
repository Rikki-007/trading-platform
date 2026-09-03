import { redirect } from "next/navigation";

/**
 * /live used to host live market data, video consulting, and trade
 * broadcasts all on one page. That content now lives on dedicated routes:
 * real market data moved to /markets (see LiveMarketsPanel there), and video
 * consulting split into /meeting (1:1 consultation booking) and /coaching
 * (expert-hosted live-trading rooms), each pairing VideoConsultingPanel with
 * whatever else is relevant there. This redirect exists so an old bookmark
 * or external link to /live still lands somewhere real instead of a 404.
 */
export default function LivePage() {
  redirect("/meeting");
}
