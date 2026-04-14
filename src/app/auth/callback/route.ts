import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";

type CookieToSet = { name: string; value: string; options: Record<string, unknown> };

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

  console.log("[auth/callback] siteUrl:", siteUrl, "code:", !!code);

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
  }

  // Collect cookies set by Supabase so we can apply them to the final response
  const pendingCookies: CookieToSet[] = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            pendingCookies.push({ name, value, options: options as Record<string, unknown> })
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  console.log("[auth/callback] exchangeCodeForSession error:", error?.message ?? "none", "cookies set:", pendingCookies.length);

  if (error) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_callback_failed`);
  }

  let redirectPath = nextParam ?? "/onboarding";

  const { data: { user } } = await supabase.auth.getUser();

  console.log("[auth/callback] user:", user?.id ?? "none");

  if (user) {
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

  console.log("[auth/callback] redirecting to:", `${siteUrl}${redirectPath}`);

  const response = NextResponse.redirect(`${siteUrl}${redirectPath}`);

  // Apply collected session cookies to the response
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  return response;
}
