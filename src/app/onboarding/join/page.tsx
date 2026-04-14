import type { Metadata } from "next";
import { getAuthSession, getAuthUserBudget } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JoinBudgetForm } from "@/app/onboarding/components/join-budget-form";

export const metadata: Metadata = {
  title: "Join Budget | Our Sanctuary",
  description: "Join your partner's budget with an invite code.",
};

export default async function JoinBudgetPage() {
  // If not authenticated → login; if already has budget → dashboard
  const { user } = await getAuthSession();
  if (!user) redirect("/login");
  const authResult = await getAuthUserBudget();
  if (authResult.ok) redirect("/dashboard");

  return <JoinBudgetForm />;
}
