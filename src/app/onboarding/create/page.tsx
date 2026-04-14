import type { Metadata } from "next";
import { getAuthSession, getAuthUserBudget } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CreateBudgetForm } from "@/app/onboarding/components/create-budget-form";

export const metadata: Metadata = {
  title: "Create Budget | Our Sanctuary",
  description: "Create a new shared budget.",
};

export default async function CreateBudgetPage() {
  // If not authenticated → login; if already has budget → dashboard
  const { user } = await getAuthSession();
  if (!user) redirect("/login");
  const authResult = await getAuthUserBudget();
  if (authResult.ok) redirect("/dashboard");

  return <CreateBudgetForm />;
}
