import SectionHeading from "@/components/layout/SectionHeading";
import PortfolioSummary from "@/components/trading/PortfolioSummary";
import ActivityLog from "@/components/trading/ActivityLog";

export const metadata = { title: "Dashboard — Lodestar Meridian Exchange" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Portfolio"
        title="Your position, at a glance"
        description="Equity, cash, and holdings — recalculated on every simulated tick."
      />
      <PortfolioSummary />

      <div id="activity" className="mt-20 scroll-mt-24">
        <SectionHeading eyebrow="History" title="Recent activity" />
        <ActivityLog />
      </div>
    </div>
  );
}
