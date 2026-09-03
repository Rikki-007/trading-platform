"use client";

import { createBrowserClient } from "@supabase/ssr";

let browserClient = null;

/**
 * Browser-side Supabase client, for use in Client Components. Returns null
 * when Supabase isn't configured (no project URL/key set) rather than
 * throwing — every auth-dependent component checks for null and renders a
 * "not configured" state instead of crashing the page.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
