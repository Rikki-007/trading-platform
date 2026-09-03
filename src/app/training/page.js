import { GraduationCap } from "lucide-react";
import SectionHeading from "@/components/layout/SectionHeading";

export const metadata = { title: "Training — Lodestar Meridian Exchange" };

export default function TrainingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Training"
        title="Tutorials & strategy guides"
        description="A structured curriculum for learning the terminal and testing real strategies — in active development."
      />
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-hairline-strong bg-navy/30 p-8 sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-hairline-strong bg-void-deep/50 text-gold">
          <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-porcelain">Coming soon</p>
            <span className="rounded-full border border-gold/25 bg-gold/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-gold">
              In progress
            </span>
          </div>
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-mist">
            Planned topics: reading an order book, market vs. limit orders, position sizing,
            and a walkthrough of every panel in this terminal. Nothing here is published yet —
            this section is honest about that until it is.
          </p>
        </div>
      </div>
    </div>
  );
}
