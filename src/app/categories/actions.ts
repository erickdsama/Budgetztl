"use server";

import { createClient, getAuthUserBudget } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export type CategoryActionState = {
  errors?: {
    name?: string[];
    icon?: string[];
    monthlyBudget?: string[];
    general?: string[];
  };
  message?: string;
  success?: boolean;
  id?: string;
};

const VALID_ICONS = [
  "home",
  "movie",
  "fitness_center",
  "medical_services",
  "pets",
  "school",
  "local_gas_station",
  "style",
  "celebration",
  "more_horiz",
  "shopping_basket",
  "restaurant",
  "bolt",
  "commute",
  "shopping_bag",
  // Income icons
  "payments",
  "star",
  "trending_up",
  "card_giftcard",
  "replay",
  "swap_horiz",
] as const;

const DEFAULT_CATEGORIES = [
  { name: "Groceries", icon: "shopping_basket", type: "Household", transaction_type: "expense", monthly_budget: 1200, sort_order: 0 },
  { name: "Dining Out", icon: "restaurant", type: "Lifestyle", transaction_type: "expense", monthly_budget: 500, sort_order: 1 },
  { name: "Utilities", icon: "bolt", type: "Fixed Costs", transaction_type: "expense", monthly_budget: 300, sort_order: 2 },
  { name: "Rent & Bills", icon: "home", type: "Fixed Costs", transaction_type: "expense", monthly_budget: 2400, sort_order: 3 },
  { name: "Transport", icon: "commute", type: "Household", transaction_type: "expense", monthly_budget: 200, sort_order: 4 },
  { name: "Entertainment", icon: "movie", type: "Lifestyle", transaction_type: "expense", monthly_budget: 150, sort_order: 5 },
  { name: "Health", icon: "medical_services", type: "Household", transaction_type: "expense", monthly_budget: 100, sort_order: 6 },
  { name: "Shopping", icon: "shopping_bag", type: "Lifestyle", transaction_type: "expense", monthly_budget: 200, sort_order: 7 },
] as const;

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", icon: "payments", type: "Income", transaction_type: "income", monthly_budget: 0, sort_order: 0 },
  { name: "Bonus", icon: "star", type: "Income", transaction_type: "income", monthly_budget: 0, sort_order: 1 },
  { name: "Dividends", icon: "trending_up", type: "Income", transaction_type: "income", monthly_budget: 0, sort_order: 2 },
  { name: "Gift", icon: "card_giftcard", type: "Income", transaction_type: "income", monthly_budget: 0, sort_order: 3 },
  { name: "Refund", icon: "replay", type: "Income", transaction_type: "income", monthly_budget: 0, sort_order: 4 },
  { name: "Transfer", icon: "swap_horiz", type: "Income", transaction_type: "income", monthly_budget: 0, sort_order: 5 },
] as const;

export async function getCategories(transactionType?: "expense" | "income"): Promise<{
  categories: CategoryRow[];
  error?: string;
}> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { categories: [], error: result.error };
  }

  const supabase = await createClient();

  let query = supabase
    .from("categories")
    .select("*")
    .eq("budget_id", result.budgetId)
    .order("sort_order", { ascending: true });

  if (transactionType) {
    query = query.eq("transaction_type", transactionType);
  }

  const { data, error } = await query;

  if (error) {
    return { categories: [], error: error.message };
  }

  return { categories: data ?? [] };
}

export type CategoryWithSpent = CategoryRow & { spent: number };

export async function getCategoriesWithSpent(transactionType?: "expense" | "income"): Promise<{
  categories: CategoryWithSpent[];
  error?: string;
}> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { categories: [], error: result.error };
  }

  const supabase = await createClient();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  let catQuery = supabase
    .from("categories")
    .select("*")
    .eq("budget_id", result.budgetId)
    .order("sort_order", { ascending: true });

  if (transactionType) {
    catQuery = catQuery.eq("transaction_type", transactionType);
  }

  const [categoriesResult, transactionsResult] = await Promise.all([
    catQuery,
    supabase
      .from("transactions")
      .select("category_id, amount")
      .eq("budget_id", result.budgetId)
      .eq("type", "expense")
      .gte("date", firstDay)
      .lte("date", lastDay),
  ]);

  if (categoriesResult.error) {
    return { categories: [], error: categoriesResult.error.message };
  }

  const spentMap: Record<string, number> = {};
  for (const tx of transactionsResult.data ?? []) {
    spentMap[tx.category_id] = (spentMap[tx.category_id] ?? 0) + Number(tx.amount);
  }

  const categories = (categoriesResult.data ?? []).map((cat) => ({
    ...cat,
    spent: spentMap[cat.id] ?? 0,
  }));

  return { categories };
}

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const icon = (formData.get("icon") as string | null)?.trim() ?? "";
  const typeLabel = (formData.get("type") as string | null)?.trim() || null;
  const monthlyBudgetRaw = formData.get("monthlyBudget") as string | null;
  const transactionTypeRaw = (formData.get("transaction_type") as string | null)?.trim() ?? "expense";
  const subcategoryOptionsRaw = (formData.get("subcategory_options") as string | null)?.trim() || null;

  // Validate inputs
  const errors: CategoryActionState["errors"] = {};

  if (!name || name.length < 1 || name.length > 50) {
    errors.name = ["Category name must be between 1 and 50 characters."];
  }

  if (!icon || !VALID_ICONS.includes(icon as (typeof VALID_ICONS)[number])) {
    errors.icon = ["Please select a valid icon."];
  }

  const monthlyBudget = monthlyBudgetRaw ? parseFloat(monthlyBudgetRaw) : NaN;
  if (isNaN(monthlyBudget) || monthlyBudget < 0) {
    errors.monthlyBudget = ["Monthly budget must be a non-negative number."];
  }

  const transactionType = transactionTypeRaw === "income" ? "income" : "expense";

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { errors: { general: [result.error] } };
  }

  const { budgetId } = result;
  const supabase = await createClient();

  // Check for duplicate name in the same budget
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("budget_id", budgetId)
    .eq("name", name)
    .limit(1)
    .single();

  if (existing) {
    return { errors: { name: ["A category with this name already exists."] } };
  }

  // Get next sort_order
  const { data: lastCategory } = await supabase
    .from("categories")
    .select("sort_order")
    .eq("budget_id", budgetId)
    .eq("transaction_type", transactionType)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = lastCategory ? lastCategory.sort_order + 1 : 0;

  // Parse subcategory_options from comma-separated string
  let subcategoryOptions: string[] | null = null;
  if (subcategoryOptionsRaw) {
    subcategoryOptions = subcategoryOptionsRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (subcategoryOptions.length === 0) subcategoryOptions = null;
  }

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      budget_id: budgetId,
      name,
      icon,
      type: typeLabel,
      transaction_type: transactionType,
      subcategory_options: subcategoryOptions as unknown as import("@/lib/supabase/types").Json | null,
      monthly_budget: monthlyBudget,
      sort_order: nextSortOrder,
    })
    .select("id")
    .single();

  if (error || !category) {
    return {
      errors: { general: [error?.message ?? "Failed to create category."] },
    };
  }

  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { success: true, id: category.id };
}

export async function updateCategory(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const id = formData.get("id") as string | null;
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const icon = (formData.get("icon") as string | null)?.trim() ?? "";
  const typeLabel = (formData.get("type") as string | null)?.trim() || null;
  const monthlyBudgetRaw = formData.get("monthlyBudget") as string | null;
  const subcategoryOptionsRaw = (formData.get("subcategory_options") as string | null)?.trim() || null;

  if (!id) {
    return { errors: { general: ["Category ID is required."] } };
  }

  // Validate inputs
  const errors: CategoryActionState["errors"] = {};

  if (!name || name.length < 1 || name.length > 50) {
    errors.name = ["Category name must be between 1 and 50 characters."];
  }

  if (!icon || !VALID_ICONS.includes(icon as (typeof VALID_ICONS)[number])) {
    errors.icon = ["Please select a valid icon."];
  }

  const monthlyBudget = monthlyBudgetRaw ? parseFloat(monthlyBudgetRaw) : NaN;
  if (isNaN(monthlyBudget) || monthlyBudget < 0) {
    errors.monthlyBudget = ["Monthly budget must be a non-negative number."];
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { errors: { general: [result.error] } };
  }

  const { budgetId } = result;
  const supabase = await createClient();

  // Check for duplicate name (exclude current category)
  const { data: existing } = await supabase
    .from("categories")
    .select("id")
    .eq("budget_id", budgetId)
    .eq("name", name)
    .neq("id", id)
    .limit(1)
    .single();

  if (existing) {
    return { errors: { name: ["A category with this name already exists."] } };
  }

  // Parse subcategory_options
  let subcategoryOptions: string[] | null = null;
  if (subcategoryOptionsRaw) {
    subcategoryOptions = subcategoryOptionsRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (subcategoryOptions.length === 0) subcategoryOptions = null;
  }

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      icon,
      type: typeLabel,
      subcategory_options: subcategoryOptions as unknown as import("@/lib/supabase/types").Json | null,
      monthly_budget: monthlyBudget,
    })
    .eq("id", id)
    .eq("budget_id", budgetId);

  if (error) {
    return { errors: { general: [error.message] } };
  }

  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { success: true };
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const result = await getAuthUserBudget();
  if (!result.ok) {
    return { success: false, error: result.error };
  }

  const { budgetId } = result;
  const supabase = await createClient();

  // Check if there are any transactions using this category
  const { count, error: countError } = await supabase
    .from("transactions")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id);

  if (countError) {
    return { success: false, error: countError.message };
  }

  if (count !== null && count > 0) {
    return {
      success: false,
      error: "Cannot delete category with existing transactions. Please delete or reassign them first."
    };
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("budget_id", budgetId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/categories");
  revalidatePath("/dashboard");
  revalidatePath("/history");
  return { success: true };
}

export async function seedDefaultCategories(budgetId: string): Promise<{ count: number; error?: string }> {
  const supabase = await createClient();

  // Check if categories already exist for this budget
  const { count: existingCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("budget_id", budgetId);

  if (existingCount !== null && existingCount > 0) {
    return { count: 0, error: "Categories already exist for this budget." };
  }

  const expenseCategories = DEFAULT_CATEGORIES.map((cat) => ({
    budget_id: budgetId,
    name: cat.name,
    icon: cat.icon,
    type: cat.type,
    transaction_type: cat.transaction_type,
    monthly_budget: cat.monthly_budget,
    sort_order: cat.sort_order,
  }));

  const incomeCategories = DEFAULT_INCOME_CATEGORIES.map((cat) => ({
    budget_id: budgetId,
    name: cat.name,
    icon: cat.icon,
    type: cat.type,
    transaction_type: cat.transaction_type,
    monthly_budget: cat.monthly_budget,
    sort_order: cat.sort_order,
  }));

  const { data, error } = await supabase
    .from("categories")
    .insert([...expenseCategories, ...incomeCategories])
    .select("id");

  if (error) {
    return { count: 0, error: error.message };
  }

  return { count: data?.length ?? 0 };
}
