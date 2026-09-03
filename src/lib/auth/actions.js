"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server Action backing the email/password login form. Redirects to
 * /dashboard (the signed-in home base) on success; on failure, redirects
 * back to /login with an `error` query param the page reads to show a
 * message (keeps this a plain <form action={...}> with no client-side JS
 * required to submit).
 */
export async function signInWithPassword(formData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=" + encodeURIComponent("Auth isn't configured yet."));
  }

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  redirect("/dashboard");
}

/**
 * Server Action backing the signup form. Supabase sends a confirmation
 * email by default (project setting) — we redirect to a "check your inbox"
 * state rather than assuming the session is active immediately.
 */
export async function signUpWithPassword(formData) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    redirect("/signup?error=" + encodeURIComponent("Auth isn't configured yet."));
  }

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) {
    redirect("/signup?error=" + encodeURIComponent(error.message));
  }

  redirect("/signup?check_email=1");
}

export async function signOut() {
  const supabase = await getSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
