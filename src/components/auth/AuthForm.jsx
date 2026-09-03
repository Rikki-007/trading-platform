"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Globe, Apple, AlertCircle } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Shared login/signup form. Email/password submits to a Server Action
 * (works with JS disabled); the OAuth buttons call the browser client
 * directly since starting an OAuth flow means immediately redirecting the
 * tab, which only makes sense client-side.
 */
export default function AuthForm({ mode, action, error, notice }) {
  const [oauthPending, setOauthPending] = useState(null);
  const isSignup = mode === "signup";

  async function handleOAuth(provider) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setOauthPending(provider);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${siteUrl}/auth/callback` },
    });
    // Browser navigates away here; no need to reset oauthPending.
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border border-hairline bg-navy/50 p-6 text-center backdrop-blur-md">
        <p className="text-sm text-mist">
          Accounts aren&apos;t configured yet — this deployment is missing its Supabase
          environment variables. The paper-trading demo below still works without signing in.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm rounded-2xl border border-hairline bg-navy/50 p-6 backdrop-blur-md"
    >
      <h1 className="font-display text-xl text-porcelain">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-1 text-sm text-mist">
        {isSignup ? "Start with a free practice balance." : "Sign in to your Meridian account."}
      </p>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-crimson/25 bg-crimson/10 px-3 py-2 text-xs text-crimson">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div className="mt-4 rounded-lg border border-cyan/25 bg-cyan/10 px-3 py-2 text-xs text-cyan">
          {notice}
        </div>
      )}

      <div className="mt-5 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={oauthPending !== null}
          className="flex items-center justify-center gap-2 rounded-lg border border-hairline bg-void-deep/40 py-2.5 text-sm text-porcelain transition-colors hover:bg-navy-light disabled:opacity-50"
        >
          <Globe className="h-4 w-4" strokeWidth={1.75} />
          {oauthPending === "google" ? "Redirecting…" : "Continue with Google"}
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={oauthPending !== null}
          className="flex items-center justify-center gap-2 rounded-lg border border-hairline bg-void-deep/40 py-2.5 text-sm text-porcelain transition-colors hover:bg-navy-light disabled:opacity-50"
        >
          <Apple className="h-4 w-4" strokeWidth={1.75} />
          {oauthPending === "apple" ? "Redirecting…" : "Continue with Apple"}
        </button>
      </div>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-mist-dim">
        <span className="h-px flex-1 bg-hairline" />
        or
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form action={action} className="flex flex-col gap-3">
        <label className="block text-xs text-mist">
          Email
          <div className="relative mt-1">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-dim" strokeWidth={1.75} />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-hairline bg-void-deep/50 py-2 pl-9 pr-3 font-mono text-sm text-porcelain outline-none transition-colors focus:border-cyan/50"
            />
          </div>
        </label>
        <label className="block text-xs text-mist">
          Password
          <div className="relative mt-1">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist-dim" strokeWidth={1.75} />
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="w-full rounded-lg border border-hairline bg-void-deep/50 py-2 pl-9 pr-3 font-mono text-sm text-porcelain outline-none transition-colors focus:border-cyan/50"
            />
          </div>
        </label>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          className="mt-1 w-full rounded-lg bg-cyan py-2.5 text-sm font-semibold text-void-deep transition-colors hover:bg-cyan/90"
        >
          {isSignup ? "Create account" : "Sign in"}
        </motion.button>
      </form>

      <p className="mt-5 text-center text-xs text-mist-dim">
        {isSignup ? (
          <>Already have an account? <a href="/login" className="text-cyan hover:underline">Sign in</a></>
        ) : (
          <>New here? <a href="/signup" className="text-cyan hover:underline">Create an account</a></>
        )}
      </p>
    </motion.div>
  );
}
