"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

async function getOrigin(): Promise<string> {
  // 1. Explicit env var — always wins (set this in Vercel dashboard)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  // 2. Vercel automatically provides VERCEL_URL for the current deployment
  //    It's the deployment domain without protocol (e.g. budgetztl.vercel.app)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // 3. Read from request headers (dev fallback)
  const headersList = await headers();
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const host = headersList.get("host");
  if (host) return `${protocol}://${host}`;

  return "http://localhost:3001";
}

export type AuthState = {
  errors?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
  message?: string;
  success?: boolean;
};

function validateEmail(email: string): string[] {
  const errors: string[] = [];
  if (!email) {
    errors.push("Email is required.");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please enter a valid email address.");
  }
  return errors;
}

function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (!password) {
    errors.push("Password is required.");
  } else if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  return errors;
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate inputs
  const errors: AuthState["errors"] = {};

  if (!fullName || fullName.trim().length < 2) {
    errors.fullName = ["Full name must be at least 2 characters."];
  }

  const emailErrors = validateEmail(email);
  if (emailErrors.length > 0) {
    errors.email = emailErrors;
  }

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    errors.password = passwordErrors;
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return {
        errors: { email: ["This email is already registered."] },
      };
    }
    return {
      errors: { general: [error.message] },
    };
  }

  // Insert profile row
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName.trim(),
    });

    if (profileError) {
      // Profile creation failed but user exists — log but don't block
      console.error("Failed to create profile:", profileError.message);
    }
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validate inputs
  const errors: AuthState["errors"] = {};

  const emailErrors = validateEmail(email);
  if (emailErrors.length > 0) {
    errors.email = emailErrors;
  }

  if (!password) {
    errors.password = ["Password is required."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      errors: { general: ["Invalid email or password."] },
    };
  }

  // Check if user belongs to any budget
  let destination = "/onboarding";
  if (data.user) {
    const { data: membership } = await supabase
      .from("budget_members")
      .select("id")
      .eq("user_id", data.user.id)
      .limit(1)
      .single();

    if (membership) {
      destination = "/dashboard";
    }
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signInWithOAuth(provider: "google" | "apple") {
  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function resetPassword(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;

  const emailErrors = validateEmail(email);
  if (emailErrors.length > 0) {
    return { errors: { email: emailErrors } };
  }

  const supabase = await createClient();

  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    return {
      errors: { general: [error.message] },
    };
  }

  return {
    success: true,
    message: "Check your email for a password reset link.",
  };
}
