"use client";

import { useState } from "react";
import { useCategories } from "@/lib/hooks/use-categories";
import { CategoryList } from "./category-list";

function Skeleton() {
  return (
    <div className="px-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-24 rounded-2xl bg-surface-container animate-pulse" />
      ))}
    </div>
  );
}

function TabContent({ activeTab }: { activeTab: "expense" | "income" }) {
  const { categories, isLoading, error } = useCategories(activeTab);

  if (isLoading) return <Skeleton />;
  if (error) {
    return (
      <div className="mx-6 rounded-xl bg-error-container px-4 py-3 text-sm text-error">
        {String(error)}
      </div>
    );
  }

  return <CategoryList categories={categories} transactionType={activeTab} />;
}

// Tab toggle is client state — switching is instant, no page reload
export function CategoriesContent() {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");

  // Pre-fetch both tabs so switching is instant after first load
  useCategories("expense");
  useCategories("income");

  return (
    <>
      {/* Tab Toggle */}
      <div className="px-6 pb-6">
        <div className="flex rounded-2xl bg-surface-container-low p-1">
          <button
            type="button"
            onClick={() => setActiveTab("expense")}
            className={`flex flex-1 items-center justify-center rounded-xl py-3 px-4 text-sm font-bold transition-colors ${
              activeTab === "expense" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("income")}
            className={`flex flex-1 items-center justify-center rounded-xl py-3 px-4 text-sm font-bold transition-colors ${
              activeTab === "income" ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary"
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <TabContent activeTab={activeTab} />
    </>
  );
}
