# Feature: Dashboard

## Overview

The main dashboard ("Financial Harmony Dashboard") is the home screen of the app. It shows at a glance: total monthly spending vs. budget, top spending categories with utilization percentages, and recent transactions. This is the primary view users interact with daily to understand their current financial position.

## User Stories

- As a user, I want to see my remaining budget for the month so that I know how much I can still spend
- As a user, I want to see spending by category so that I know where my money is going
- As a user, I want to see recent transactions so that I can verify entries and track activity
- As a couple, I want to see our combined spending so that we stay aligned on our budget

## UI Screens

- **Stitch project**: `1549972375507522114` (Couple Budget Tracker)
- `cbf91b6960494a9f93ac0f69fadf0423` — **Vibrant Dashboard**: Full dashboard with budget health card, category breakdown, recent activity, and bottom navigation

## UI Components

### Header
- Title: "Financial Harmony Dashboard"
- Subtitle: "Our Shared Sanctuary"
- Couple portrait / avatars of both budget members
- Notifications icon (bell)

### Budget Health Card
- **Remaining amount**: Large dollar figure (e.g. "$4,250.00")
- **Spent percentage**: Progress bar showing % of budget used (e.g. "64%")
- **Spent amount**: Dollar amount spent (e.g. "$4,352")
- **Budgeted amount**: Total monthly budget (e.g. "$6,800")
- Visual: Actual vs. Budgeted comparison

### Budget by Category (top 3)
- Each category card shows:
  - Category name and icon
  - Utilization percentage (e.g. "70% Utilized")
  - Spent vs. budgeted (e.g. "$840 of $1,200")
  - Status: "Paid" for fixed costs at 100%
- "View Analysis" link to full category breakdown

### Recent Activity (last 3 transactions)
- Each entry shows:
  - Merchant/description
  - Category icon
  - Amount (negative for expenses)
  - Date and time
  - User avatar (who made the transaction)

### Bottom Navigation
- Dashboard (active)
- History
- Add (+) — floating action or center button
- Categories
- Settings

## Data Model

This feature reads from tables defined in other specs. No new tables needed.

**Key queries**:
1. Monthly spending total: SUM of `transactions.amount` WHERE `type = 'expense'` AND current month
2. Category breakdown: GROUP BY `transactions.category_id` with JOIN to `categories` for budget limits
3. Recent transactions: SELECT from `transactions` ORDER BY `date` DESC LIMIT 3

## Server Actions

### `getDashboardData`
- **Input**: `{ budgetId: string }`
- **Output**:
  ```typescript
  {
    budget: { name: string, currency: string, totalBudgeted: number }
    monthlySpending: { spent: number, remaining: number, percentage: number }
    topCategories: Array<{
      id: string, name: string, icon: string
      spent: number, budgeted: number, percentage: number
    }>
    recentTransactions: Array<{
      id: string, description: string, amount: number
      category: { name: string, icon: string }
      date: string, user: { fullName: string, avatarUrl: string | null }
    }>
  }
  ```
- **Auth**: Required (budget member)
- **Flow**: Parallel queries for monthly totals, top 3 categories, last 3 transactions

## Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/dashboard` | Main dashboard | Required, budget member |

## Acceptance Criteria

- [x] Dashboard displays current month's total spending and remaining budget
- [x] Spending progress bar shows correct percentage
- [x] Top 3 categories display with utilization percentages
- [x] Categories at 100% show as "Paid" (fixed costs like rent)
- [x] Recent activity shows last 3 transactions with merchant, amount, date, and who added it
- [x] Amounts are formatted in the budget's currency (USD/EUR/GBP/JPY)
- [x] Dashboard data refreshes when navigating back from adding a transaction
- [x] "View Analysis" link navigates to categories page
- [x] Bottom navigation highlights "Dashboard" as active
- [x] Empty state: shows a friendly message when no transactions exist yet
- [x] Both budget members' transactions are included in totals

## Out of Scope

- Push notifications
- Real-time updates (live sync between partners)
- Monthly budget editing from dashboard
- Charts or graphs on the dashboard (those are in Historical Trends)
