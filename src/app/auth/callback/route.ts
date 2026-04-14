import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import type { Database } from "@/lib/supabase/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    (request.headers.get("x-forwarded-host")
      ? `https://${request.headers.get("x-forwarded-host")}`
      : null) ??
    new URL(request.url).origin;

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
  }

  // Collect cookies emitted by Supabase during the code exchange
  const pendingCookies: ResponseCookie[] = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Collect — applied to the final response below
          cookiesToSet.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, ...options })
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
  }

  // Determine where to send the user
  let redirectPath = nextParam ?? "/onboarding";

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Create profile for first-time OAuth users
    const { data: existingProfile } = await supabase
      .from("profiles").select("id").eq("id", user.id).single();

    if (!existingProfile) {
      const fullName =
        (user.user_metadata?.full_name as string) ??
        (user.user_metadata?.name as string) ??
        "User";
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      });
    }

    if (!nextParam) {
      const { data: membership } = await supabase
        .from("budget_members").select("id").eq("user_id", user.id).limit(1).single();
      redirectPath = membership ? "/dashboard" : "/onboarding";
    }
  }

  // Build final response and apply all collected session cookies
  const response = NextResponse.redirect(`${siteUrl}${redirectPath}`);
  pendingCookies.forEach((cookie) => response.cookies.set(cookie));

  return response;
}
