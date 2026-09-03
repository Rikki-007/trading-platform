import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers — reads/writes the session via Next.js cookies. Returns
 * null when unconfigured, same contract as the browser client.
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component that can't set cookies — the
          // session refresh in middleware.js already handles this case.
        }
      },
    },
  });
}

/**
 * Server-only admin client using the service-role key — bypasses Row Level
 * Security. Only ever import this from trusted server code (webhooks, admin
 * routes) and NEVER from anything reachable with user-supplied `req` data
 * without an explicit auth/role check first. Returns null when unconfigured.
 */
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  // Plain createClient (not the ssr cookie-aware client) — the admin client
  // never needs to read/write browser cookies.
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
