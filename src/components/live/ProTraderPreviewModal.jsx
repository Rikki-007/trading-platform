"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import TerminalMockupPreview from "./TerminalMockupPreview";

/**
 * Full-size look at the Pro Trader terminal mockup — same dismiss pattern
 * (backdrop click / X / Escape) as AuthModal and TrainingIntroModal, so
 * every modal in the app behaves identically.
 */
export default function ProTraderPreviewModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-void-deep/80 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-3xl"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-hairline-strong bg-navy text-mist shadow-lg transition-colors hover:text-porcelain"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
            <div className="rounded-2xl border border-hairline-strong/60 bg-navy/90 p-4 shadow-2xl backdrop-blur-xl">
              <p className="mb-3 px-1 text-xs text-mist-dim">
                Preview mockup — will be replaced with the client&rsquo;s real Pro Trader interface
                screenshots.
              </p>
              <TerminalMockupPreview large />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
