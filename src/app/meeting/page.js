import SectionHeading from "@/components/layout/SectionHeading";
import VideoConsultingPanel from "@/components/video/VideoConsultingPanel";

export const metadata = { title: "Online Meeting — Lodestar Meridian Exchange" };

/**
 * The dedicated booking/joining surface for 1:1 expert consultations —
 * split out from the old catch-all /live page so "I want to talk to
 * someone about my account" has its own clear destination, distinct from
 * /coaching's group live-trading sessions. Reuses VideoConsultingPanel
 * (admin start / participant join) scoped to the consultation room kind.
 */
export default function MeetingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Online Meeting"
        title="Book a 1:1 consultation"
        description="A private video session with an admin to walk through strategy or get hands-on help with your account. Inert until Daily.co is configured — see .env.example."
      />
      <VideoConsultingPanel mode="consultation" />
    </div>
  );
}
