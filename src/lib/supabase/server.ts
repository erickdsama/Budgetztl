import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "@/lib/supabase/types";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

/**
 * Fast session check — reads from cookie only, NO network request.
 * Use this in page shells just to redirect unauthenticated users.
 * Data security is enforced by the API routes which use getAuthUser().
 */
export const getAuthSession = cache(async () => {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return { session, user: session?.user ?? null };
});

/**
 * Cached getUser — validates JWT with Supabase server (network request).
 * Use in API routes and server actions where security matters.
 * Deduplicated per render cycle via React cache().
 */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
});

/**
 * Cached budget membership lookup — deduplicates the budget_members query
 * within a single render, same principle as getAuthUser.
 */
export const getAuthUserBudget = cache(async (): Promise<
  | { ok: true; userId: string; budgetId: string }
  | { ok: false; error: string }
> => {
  const { user, error } = await getAuthUser();
  if (error || !user) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("budget_members")
    .select("budget_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) return { ok: false, error: "No budget found" };
  return { ok: true, userId: user.id, budgetId: membership.budget_id };
});
