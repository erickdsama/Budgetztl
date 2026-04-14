"use server";

import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { seedDefaultCategories } from "@/app/categories/actions";

export type OnboardingState = {
  errors?: {
    name?: string[];
    currency?: string[];
    inviteCode?: string[];
    general?: string[];
  };
  message?: string;
  success?: boolean;
};

const VALID_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "MXN"] as const;
type Currency = (typeof VALID_CURRENCIES)[number];

function generateInviteCode(): string {
  const code = Math.floor(Math.random() * 1_000_000);
  return code.toString().padStart(6, "0");
}

export async function createBudget(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const currency = formData.get("currency") as string | null;

  // Validate inputs
  const errors: OnboardingState["errors"] = {};

  if (!name || name.length < 2) {
    errors.name = ["Budget name must be at least 2 characters."];
  }

  if (!currency || !VALID_CURRENCIES.includes(currency as Currency)) {
    errors.currency = ["Please select a valid currency."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Check auth (cached)
  const { user } = await getAuthUser();

  if (!user) {
    return { errors: { general: ["You must be signed in."] } };
  }

  const supabase = await createClient();

  // Check if user already has a budget
  const { data: existingMembership } = await supabase
    .from("budget_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existingMembership) {
    return { errors: { general: ["You already belong to a budget."] } };
  }

  // Generate a unique invite code
  let inviteCode = generateInviteCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const { data: existing } = await supabase
      .from("budgets")
      .select("id")
      .eq("invite_code", inviteCode)
      .limit(1)
      .single();

    if (!existing) break;
    inviteCode = generateInviteCode();
    attempts++;
  }

  if (attempts >= maxAttempts) {
    return {
      errors: { general: ["Unable to generate invite code. Please try again."] },
    };
  }

  // Insert budget
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .insert({
      name,
      currency: currency as Currency,
      invite_code: inviteCode,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (budgetError || !budget) {
    return {
      errors: {
        general: [budgetError?.message ?? "Failed to create budget."],
      },
    };
  }

  // Insert budget member (owner)
  const { error: memberError } = await supabase
    .from("budget_members")
    .insert({
      budget_id: budget.id,
      user_id: user.id,
      role: "owner",
    });

  if (memberError) {
    return {
      errors: { general: [memberError.message] },
    };
  }

  // Seed default categories for the new budget
  await seedDefaultCategories(budget.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function joinBudget(
  _prevState: OnboardingState,
  formData: FormData
): Promise<OnboardingState> {
  const inviteCode = (formData.get("inviteCode") as string | null)?.trim() ?? "";

  // Validate
  const errors: OnboardingState["errors"] = {};

  if (!inviteCode || inviteCode.length !== 6 || !/^\d{6}$/.test(inviteCode)) {
    errors.inviteCode = ["Please enter a valid 6-digit code."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Check auth (cached)
  const { user } = await getAuthUser();

  if (!user) {
    return { errors: { general: ["You must be signed in."] } };
  }

  const supabase = await createClient();

  // Check if user already has a budget
  const { data: existingMembership } = await supabase
    .from("budget_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (existingMembership) {
    return { errors: { general: ["You already belong to a budget."] } };
  }

  // Lookup budget by invite code
  const { data: budget, error: budgetError } = await supabase
    .from("budgets")
    .select("id, name")
    .eq("invite_code", inviteCode)
    .single();

  if (budgetError || !budget) {
    return {
      errors: { inviteCode: ["Invalid invite code. Please check and try again."] },
    };
  }

  // Check member count (max 2)
  const { count } = await supabase
    .from("budget_members")
    .select("id", { count: "exact", head: true })
    .eq("budget_id", budget.id);

  if (count !== null && count >= 2) {
    return {
      errors: {
        inviteCode: ["This budget already has two members and is full."],
      },
    };
  }

  // Insert budget member
  const { error: memberError } = await supabase
    .from("budget_members")
    .insert({
      budget_id: budget.id,
      user_id: user.id,
      role: "member",
    });

  if (memberError) {
    if (memberError.message.includes("duplicate") || memberError.message.includes("unique")) {
      return {
        errors: { inviteCode: ["You are already a member of this budget."] },
      };
    }
    return {
      errors: { general: [memberError.message] },
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
