"use server";

import { createClient, getAuthUserBudget } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type ScheduledRow = Database["public"]["Tables"]["scheduled_transactions"]["Row"];

export type ScheduledWithCategory = ScheduledRow & {
  category_name: string | null;
  category_icon: string | null;
};

export async function getScheduledTransactions(): Promise<{
  scheduled: ScheduledWithCategory[];
  error?: string;
}> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { scheduled: [], error: result.error };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scheduled_transactions")
    .select("*, categories(name, icon)")
    .eq("budget_id", result.budgetId)
    .order("next_due_date", { ascending: true });

  if (error) {
    return { scheduled: [], error: error.message };
  }

  const scheduled: ScheduledWithCategory[] = (data ?? []).map((row) => {
    const cat = row.categories as { name: string; icon: string } | null;
    return {
      ...row,
      categories: undefined as never,
      category_name: cat?.name ?? null,
      category_icon: cat?.icon ?? null,
    };
  });

  return { scheduled };
}

export async function toggleScheduled(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { success: false, error: result.error };
  }

  const supabase = await createClient();

  // Get current state
  const { data: current } = await supabase
    .from("scheduled_transactions")
    .select("is_active")
    .eq("id", id)
    .eq("user_id", result.userId)
    .single();

  if (!current) {
    return { success: false, error: "Scheduled transaction not found." };
  }

  const { error } = await supabase
    .from("scheduled_transactions")
    .update({ is_active: !current.is_active })
    .eq("id", id)
    .eq("user_id", result.userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings/scheduled");
  return { success: true };
}

export async function deleteScheduled(id: string): Promise<{ success: boolean; error?: string }> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { success: false, error: result.error };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("scheduled_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", result.userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/settings/scheduled");
  return { success: true };
}
