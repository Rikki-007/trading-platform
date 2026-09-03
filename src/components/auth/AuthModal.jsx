"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AuthForm from "./AuthForm";
import { signInWithPassword, signUpWithPassword } from "@/lib/auth/actions";

/**
 * The glassmorphic sign-up/log-in surface, opened from ProfileMenu instead
 * of navigating to a separate page — switching between "Sign in" and
 * "Create account" happens in place via AuthForm's onModeChange, so the
 * modal never has to close and reopen. /login and /signup still exist as
 * real routes (a failed submit's server-side redirect lands there with the
 * error, and they're a fine standalone entry point too) — this is just the
 * primary, in-context way to reach the same form.
 */
export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState("login");

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
            className="relative"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-hairline-strong bg-navy text-mist shadow-lg transition-colors hover:text-porcelain"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
            <AuthForm
              mode={mode}
              action={mode === "signup" ? signUpWithPassword : signInWithPassword}
              onModeChange={setMode}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
