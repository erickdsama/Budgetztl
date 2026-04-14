"use server";

import { createClient, getAuthUser, getAuthUserBudget } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { Database, Json } from "@/lib/supabase/types";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type SettingsMember = {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
};

export type UserPreferences = {
  darkMode: boolean;
  notifications: boolean;
  language?: "en" | "es";
};

export type SettingsData = {
  profile: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    email: string;
    preferences: UserPreferences;
  };
  budget: {
    id: string;
    name: string;
    currency: string;
    createdBy: string;
    initialBalance: number;
  };
  members: SettingsMember[];
  isOwner: boolean;
};

export type SettingsResult =
  | { ok: true; data: SettingsData }
  | { ok: false; error: string; redirect?: string };

export type ActionResult = {
  success: boolean;
  error?: string;
};

export type InviteCodeResult = {
  inviteCode?: string;
  error?: string;
};

export type PasswordState = {
  errors?: {
    currentPassword?: string[];
    newPassword?: string[];
    confirmPassword?: string[];
    general?: string[];
  };
  success?: boolean;
  message?: string;
};

// ------------------------------------------------------------------
// getSettingsData
// ------------------------------------------------------------------

export async function getSettingsData(): Promise<SettingsResult> {
  // Auth + budget membership check (cached)
  const authResult = await getAuthUserBudget();
  if (!authResult.ok) {
    if (authResult.error === "Not authenticated") {
      return { ok: false, error: "Not authenticated", redirect: "/login" };
    }
    return { ok: false, error: "No budget found", redirect: "/onboarding" };
  }

  const { userId, budgetId } = authResult;
  // getAuthUser is cached — this re-uses the same result, no extra network call.
  // Non-null assertion is safe: getAuthUserBudget returned ok:true, so user exists.
  const { user: authUser } = await getAuthUser();
  const userEmail = authUser?.email ?? "";
  const supabase = await createClient();

  // We need the role for this budget, which getAuthUserBudget doesn't return.
  // Fetch membership role alongside the parallel queries.
  const [profileResult, budgetResult, membersResult, membershipResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, preferences")
      .eq("id", userId)
      .single(),
    supabase
      .from("budgets")
      .select("id, name, currency, created_by, initial_balance")
      .eq("id", budgetId)
      .single(),
    supabase
      .from("budget_members")
      .select("user_id, role, profiles(full_name, avatar_url)")
      .eq("budget_id", budgetId),
    supabase
      .from("budget_members")
      .select("role")
      .eq("budget_id", budgetId)
      .eq("user_id", userId)
      .single(),
  ]);

  if (profileResult.error || !profileResult.data) {
    return { ok: false, error: "Failed to load profile." };
  }

  if (budgetResult.error || !budgetResult.data) {
    return { ok: false, error: "Failed to load budget data." };
  }

  const profile = profileResult.data;
  const budget = budgetResult.data;

  // Parse preferences safely
  const rawPrefs =
    typeof profile.preferences === "object" &&
    profile.preferences !== null &&
    !Array.isArray(profile.preferences)
      ? (profile.preferences as Record<string, unknown>)
      : {};

  const preferences: UserPreferences = {
    darkMode: rawPrefs.darkMode === true,
    notifications: rawPrefs.notifications !== false, // default true
    language: (rawPrefs.language === "es" ? "es" : "en") as "en" | "es",
  };

  // Build members list
  const members: SettingsMember[] = (membersResult.data ?? []).map((m) => {
    const p = m.profiles as unknown as {
      full_name: string;
      avatar_url: string | null;
    } | null;
    return {
      userId: m.user_id,
      fullName: p?.full_name ?? "User",
      avatarUrl: p?.avatar_url ?? null,
      role: m.role,
    };
  });

  const isOwner = membershipResult.data?.role === "owner";

  return {
    ok: true,
    data: {
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        avatarUrl: profile.avatar_url,
        email: userEmail,
        preferences,
      },
      budget: {
        id: budget.id,
        name: budget.name,
        currency: budget.currency,
        createdBy: budget.created_by,
        initialBalance: Number(budget.initial_balance ?? 0),
      },
      members,
      isOwner,
    },
  };
}

// ------------------------------------------------------------------
// updateProfile
// ------------------------------------------------------------------

export async function updateProfile(data: {
  fullName?: string;
  avatarUrl?: string;
}): Promise<ActionResult> {
  const { user } = await getAuthUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = await createClient();

  const updates: ProfileUpdate = {};

  if (data.fullName !== undefined) {
    const name = data.fullName.trim();
    if (name.length < 2) {
      return { success: false, error: "Name must be at least 2 characters." };
    }
    updates.full_name = name;
  }

  if (data.avatarUrl !== undefined) {
    updates.avatar_url = data.avatarUrl;
  }

  if (!updates.full_name && updates.avatar_url === undefined) {
    return { success: false, error: "Nothing to update." };
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

// ------------------------------------------------------------------
// updateBudgetName
// ------------------------------------------------------------------

export async function updateBudgetName(data: {
  budgetId: string;
  name: string;
}): Promise<ActionResult> {
  const { user } = await getAuthUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const name = data.name.trim();
  if (name.length < 2) {
    return {
      success: false,
      error: "Budget name must be at least 2 characters.",
    };
  }

  const supabase = await createClient();

  // Verify user is the budget owner
  const { data: membership } = await supabase
    .from("budget_members")
    .select("role")
    .eq("budget_id", data.budgetId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Only the budget owner can rename it." };
  }

  const { error } = await supabase
    .from("budgets")
    .update({ name })
    .eq("id", data.budgetId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

// ------------------------------------------------------------------
// getInviteCode
// ------------------------------------------------------------------

export async function getInviteCode(data: {
  budgetId: string;
}): Promise<InviteCodeResult> {
  const { user } = await getAuthUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();

  // Verify user is the budget owner
  const { data: membership } = await supabase
    .from("budget_members")
    .select("role")
    .eq("budget_id", data.budgetId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "owner") {
    return { error: "Only the budget owner can view the invite code." };
  }

  const { data: budget, error } = await supabase
    .from("budgets")
    .select("invite_code")
    .eq("id", data.budgetId)
    .single();

  if (error || !budget) {
    return { error: "Failed to load invite code." };
  }

  return { inviteCode: budget.invite_code };
}

// ------------------------------------------------------------------
// regenerateInviteCode
// ------------------------------------------------------------------

function generateInviteCode(): string {
  const code = Math.floor(Math.random() * 1_000_000);
  return code.toString().padStart(6, "0");
}

export async function regenerateInviteCode(data: {
  budgetId: string;
}): Promise<InviteCodeResult> {
  const { user } = await getAuthUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  const supabase = await createClient();

  // Verify user is the budget owner
  const { data: membership } = await supabase
    .from("budget_members")
    .select("role")
    .eq("budget_id", data.budgetId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "owner") {
    return { error: "Only the budget owner can regenerate the invite code." };
  }

  // Generate a unique code
  let newCode = generateInviteCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from("budgets")
      .select("id")
      .eq("invite_code", newCode)
      .neq("id", data.budgetId)
      .limit(1)
      .single();

    if (!existing) break;
    newCode = generateInviteCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return { error: "Unable to generate a unique code. Try again." };
  }

  const { error } = await supabase
    .from("budgets")
    .update({ invite_code: newCode })
    .eq("id", data.budgetId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { inviteCode: newCode };
}

// ------------------------------------------------------------------
// removeMember
// ------------------------------------------------------------------

export async function removeMember(data: {
  budgetId: string;
  userId: string;
}): Promise<ActionResult> {
  const { user } = await getAuthUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // Cannot remove yourself
  if (data.userId === user.id) {
    return { success: false, error: "You cannot remove yourself." };
  }

  const supabase = await createClient();

  // Verify current user is the budget owner
  const { data: membership } = await supabase
    .from("budget_members")
    .select("role")
    .eq("budget_id", data.budgetId)
    .eq("user_id", user.id)
    .single();

  if (!membership || membership.role !== "owner") {
    return { success: false, error: "Only the budget owner can remove members." };
  }

  const { error } = await supabase
    .from("budget_members")
    .delete()
    .eq("budget_id", data.budgetId)
    .eq("user_id", data.userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

// ------------------------------------------------------------------
// updatePreferences
// ------------------------------------------------------------------

export async function updatePreferences(data: {
  darkMode?: boolean;
  notifications?: boolean;
  language?: "en" | "es";
}): Promise<ActionResult> {
  const { user } = await getAuthUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const supabase = await createClient();

  // Get current preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("preferences")
    .eq("id", user.id)
    .single();

  const rawPrefs =
    typeof profile?.preferences === "object" &&
    profile.preferences !== null &&
    !Array.isArray(profile.preferences)
      ? (profile.preferences as Record<string, Json | undefined>)
      : {};

  const updatedPrefs: Record<string, Json | undefined> = { ...rawPrefs };
  if (data.darkMode !== undefined) {
    updatedPrefs.darkMode = data.darkMode;
  }
  if (data.notifications !== undefined) {
    updatedPrefs.notifications = data.notifications;
  }
  if (data.language !== undefined) {
    updatedPrefs.language = data.language;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ preferences: updatedPrefs as Json })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Set cookies for SSR theme/lang detection
  const cookieStore = await cookies();
  const cookieOpts = { path: "/", maxAge: 60 * 60 * 24 * 365 };
  if (data.darkMode !== undefined) {
    cookieStore.set("theme", data.darkMode ? "dark" : "light", cookieOpts);
  }
  if (data.language !== undefined) {
    cookieStore.set("lang", data.language, cookieOpts);
  }

  revalidatePath("/settings");
  return { success: true };
}

// ------------------------------------------------------------------
// changePassword
// ------------------------------------------------------------------

export async function changePassword(
  _prevState: PasswordState,
  formData: FormData
): Promise<PasswordState> {
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validate inputs
  const errors: PasswordState["errors"] = {};

  if (!currentPassword) {
    errors.currentPassword = ["Current password is required."];
  }

  if (!newPassword) {
    errors.newPassword = ["New password is required."];
  } else if (newPassword.length < 8) {
    errors.newPassword = ["New password must be at least 8 characters."];
  }

  if (!confirmPassword) {
    errors.confirmPassword = ["Please confirm your new password."];
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = ["Passwords do not match."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const { user } = await getAuthUser();

  if (!user) {
    return { errors: { general: ["Not authenticated."] } };
  }

  const supabase = await createClient();

  // Verify current password by attempting sign-in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password: currentPassword,
  });

  if (signInError) {
    return { errors: { currentPassword: ["Current password is incorrect."] } };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { errors: { general: [updateError.message] } };
  }

  return { success: true, message: "Password updated successfully." };
}

// ------------------------------------------------------------------
// updateInitialBalance
// ------------------------------------------------------------------

export async function updateInitialBalance(amount: number): Promise<ActionResult> {
  if (isNaN(amount) || amount < 0) return { success: false, error: "Invalid amount." };
  const result = await getAuthUserBudget();
  if (!result.ok) return { success: false, error: result.error };
  const supabase = await createClient();
  const { error } = await supabase
    .from("budgets")
    .update({ initial_balance: amount })
    .eq("id", result.budgetId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/settings");
  revalidatePath("/history");
  return { success: true };
}
