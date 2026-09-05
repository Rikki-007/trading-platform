import { Phone, Mail } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";
import VideoConsultingPanel from "@/components/video/VideoConsultingPanel";
import BroadcastFeed from "@/components/notifications/BroadcastFeed";
import { CONTACT_INFO } from "@/lib/contact/info";

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

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-hairline bg-navy/30 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mist">Prefer to talk directly instead of booking a room?</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <a
            href={`tel:${CONTACT_INFO.expertLinePhone.replace(/[^+\d]/g, "")}`}
            className="flex items-center gap-1.5 text-porcelain hover:text-cyan"
          >
            <Phone className="h-3.5 w-3.5" strokeWidth={1.75} />
            {CONTACT_INFO.expertLinePhone}
          </a>
          <a
            href={`mailto:${CONTACT_INFO.supportEmail}`}
            className="flex items-center gap-1.5 text-porcelain hover:text-cyan"
          >
            <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
            {CONTACT_INFO.supportEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
