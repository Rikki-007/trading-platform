import SectionHeading from "@/components/layout/SectionHeading";
import LiveMarketsPanel from "@/components/trading/LiveMarketsPanel";
import VideoConsultingPanel from "@/components/video/VideoConsultingPanel";
import BroadcastFeed from "@/components/notifications/BroadcastFeed";

export const metadata = { title: "Live — Lodestar Meridian Exchange" };

export default function LivePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Phase 2"
        title="Live data, consulting & broadcasts"
        description="Real market prices, admin-hosted video rooms, and notify-only trade broadcasts — each inert until its own service is configured (see .env.example)."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <LiveMarketsPanel />
        <VideoConsultingPanel />
        <div className="lg:col-span-2">
          <BroadcastFeed />
        </div>
      </div>
    </div>
  );
}
