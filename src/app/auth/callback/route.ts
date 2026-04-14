import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if the user already has a profile; if not, create one from auth metadata
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let next = nextParam ?? "/onboarding";

      if (user) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();

        if (!existingProfile) {
          const fullName =
            (user.user_metadata?.full_name as string) ??
            (user.user_metadata?.name as string) ??
            "User";

          await supabase.from("profiles").insert({
            id: user.id,
            full_name: fullName,
            avatar_url:
              (user.user_metadata?.avatar_url as string | undefined) ?? null,
          });
        }

        // If no explicit next param, route based on budget membership
        if (!nextParam) {
          const { data: membership } = await supabase
            .from("budget_members")
            .select("id")
            .eq("user_id", user.id)
            .limit(1)
            .single();

          if (membership) {
            next = "/dashboard";
          }
        }
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // If code exchange fails, redirect to login with an error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
