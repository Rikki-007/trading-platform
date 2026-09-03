import SectionHeading from "@/components/layout/SectionHeading";
import VideoConsultingPanel from "@/components/video/VideoConsultingPanel";
import BroadcastFeed from "@/components/notifications/BroadcastFeed";

export const metadata = { title: "Mentorship — Lodestar Meridian Exchange" };

/**
 * The single expert-guidance destination — booking a 1:1 consultation and
 * joining an admin-hosted live-trading room used to be two separate routes
 * (/meeting, /coaching); both start from the same VideoConsultingPanel
 * (mode="both" shows both admin start-buttons), so there's no reason to
 * split them across pages. The trade-broadcast feed sits alongside it since
 * it's most relevant during a live coaching session.
 */
export default function MentorshipPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Mentorship"
        title="Learn directly from an expert"
        description="Book a private 1:1 consultation, or join an admin-hosted live-trading room and watch trade broadcasts land in real time. Inert until Daily.co is configured — see .env.example."
      />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <VideoConsultingPanel mode="both" />
        <BroadcastFeed />
      </div>
    </div>
  );
}
