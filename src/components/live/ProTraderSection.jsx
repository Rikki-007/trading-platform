"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import TerminalMockupPreview from "./TerminalMockupPreview";
import ProTraderPreviewModal from "./ProTraderPreviewModal";

/**
 * Showcases the Pro Trader terminal layout on the Live Trading page. The
 * screenshot itself is a placeholder mockup (see TerminalMockupPreview) —
 * this component just owns the open/closed state for the full-size modal,
 * kept separate from the server-component page around it.
 */
export default function ProTraderSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-mist-dim">Charting terminal</p>
          <h3 className="mt-1 font-display text-lg text-porcelain">Pro Trader</h3>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-hairline-strong bg-void-deep/40 px-3.5 py-1.5 text-xs font-medium text-porcelain transition-colors hover:bg-navy-light"
        >
          <Maximize2 className="h-3 w-3" strokeWidth={2} />
          View full interface
        </button>
      </div>

      <button onClick={() => setOpen(true)} className="block w-full text-left">
        <TerminalMockupPreview />
      </button>
      <p className="mt-2 text-xs text-mist-dim">
        Preview mockup — will be replaced with the client&rsquo;s real Pro Trader interface screenshots.
      </p>

      <ProTraderPreviewModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
