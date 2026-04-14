"use server";

import { createClient, getAuthUserBudget } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type TransactionActionState = {
  errors?: {
    amount?: string[];
    categoryId?: string[];
    type?: string[];
    date?: string[];
    description?: string[];
    general?: string[];
  };
  message?: string;
  success?: boolean;
};

function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createTransaction(
  _prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  const amountRaw = formData.get("amount") as string | null;
  const categoryId = (formData.get("categoryId") as string | null)?.trim() ?? "";
  const type = (formData.get("type") as string | null)?.trim() ?? "";
  const date = (formData.get("date") as string | null)?.trim() ?? "";
  const description =
    (formData.get("description") as string | null)?.trim() || null;
  const isRecurringRaw = formData.get("isRecurring") as string | null;
  const frequencyRaw = (formData.get("frequency") as string | null)?.trim() ?? "monthly";
  const endDateRaw = (formData.get("endDate") as string | null)?.trim() || null;

  // Validate inputs
  const errors: TransactionActionState["errors"] = {};

  const amount = amountRaw ? parseFloat(amountRaw) : NaN;
  if (isNaN(amount) || amount <= 0) {
    errors.amount = ["Amount must be greater than zero."];
  } else if (amount > 9999999999.99) {
    errors.amount = ["Amount is too large."];
  }

  if (!categoryId) {
    errors.categoryId = ["Please select a category."];
  }

  if (type !== "expense" && type !== "income") {
    errors.type = ["Transaction type must be expense or income."];
  }

  if (!date) {
    errors.date = ["Please select a date."];
  } else {
    const today = getTodayDateString();
    if (date > today) {
      errors.date = ["Date cannot be in the future."];
    }
  }

  if (description && description.length > 500) {
    errors.description = ["Notes must be 500 characters or fewer."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { errors: { general: [result.error] } };
  }

  const { budgetId, userId } = result;
  const supabase = await createClient();

  // Verify the category belongs to this budget
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", categoryId)
    .eq("budget_id", budgetId)
    .limit(1)
    .single();

  if (!category) {
    return { errors: { categoryId: ["Invalid category."] } };
  }

  // Insert the transaction
  const { error: insertError } = await supabase
    .from("transactions")
    .insert({
      budget_id: budgetId,
      user_id: userId,
      category_id: categoryId,
      type,
      amount: Math.round(amount * 100) / 100,
      description,
      date,
    });

  if (insertError) {
    return {
      errors: { general: [insertError.message] },
    };
  }

  // If recurring, insert into scheduled_transactions
  const isRecurring = isRecurringRaw === "true";
  if (isRecurring) {
    const frequency = ["weekly", "monthly", "yearly"].includes(frequencyRaw)
      ? (frequencyRaw as "weekly" | "monthly" | "yearly")
      : "monthly";

    // Calculate next_due_date based on frequency and date
    const txDate = new Date(date + "T00:00:00");
    const nextDue = new Date(txDate);
    if (frequency === "weekly") {
      nextDue.setDate(nextDue.getDate() + 7);
    } else if (frequency === "monthly") {
      nextDue.setMonth(nextDue.getMonth() + 1);
    } else if (frequency === "yearly") {
      nextDue.setFullYear(nextDue.getFullYear() + 1);
    }
    const nextDueDateStr = nextDue.toISOString().split("T")[0];

    await supabase.from("scheduled_transactions").insert({
      budget_id: budgetId,
      user_id: userId,
      category_id: categoryId || null,
      type,
      amount: Math.round(amount * 100) / 100,
      description,
      frequency,
      start_date: date,
      next_due_date: nextDueDateStr,
      end_date: endDateRaw || null,
      is_active: true,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/categories");
  revalidatePath("/history");
  redirect("/dashboard");
}

export async function getTransactionsByMonth(params: {
  budgetId: string;
  year: number;
  month: number;
}): Promise<{
  transactions: Array<{
    id: string;
    budget_id: string;
    user_id: string;
    category_id: string;
    type: string;
    amount: number;
    description: string | null;
    date: string;
    created_at: string;
  }>;
  error?: string;
}> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { transactions: [], error: result.error };
  }

  // Verify the user belongs to the requested budget
  if (result.budgetId !== params.budgetId) {
    return { transactions: [], error: "You do not have access to this budget." };
  }

  const startDate = `${params.year}-${String(params.month).padStart(2, "0")}-01`;
  const nextMonth = params.month === 12 ? 1 : params.month + 1;
  const nextYear = params.month === 12 ? params.year + 1 : params.year;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("budget_id", params.budgetId)
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false });

  if (error) {
    return { transactions: [], error: error.message };
  }

  return { transactions: data ?? [] };
}

export async function deleteTransaction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { success: false, error: result.error };
  }

  const { userId } = result;
  const supabase = await createClient();

  // Only allow deleting own transactions
  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/categories");
  return { success: true };
}
