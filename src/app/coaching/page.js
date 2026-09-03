import SectionHeading from "@/components/layout/SectionHeading";
import VideoConsultingPanel from "@/components/video/VideoConsultingPanel";
import BroadcastFeed from "@/components/notifications/BroadcastFeed";

export const metadata = { title: "Train with Expert — Lodestar Meridian Exchange" };

/**
 * The expert coaching suite — an admin-hosted live-trading room paired with
 * the trade-broadcast feed, so a session isn't just watching a video: the
 * admin's calls land here in real time alongside it. Distinct from
 * /meeting's 1:1 consultation booking, which has no broadcast feed since
 * there's no group session to broadcast into.
 */
export default function CoachingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Train with Expert"
        title="Live coaching sessions"
        description="Join an admin-hosted live-trading room and watch trade broadcasts land in real time as the session runs."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VideoConsultingPanel mode="coaching" />
        <BroadcastFeed />
      </div>
    </div>
  );
}
