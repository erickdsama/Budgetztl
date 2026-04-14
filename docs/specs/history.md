# Feature: Historical Trends

## Overview

A historical view of spending data over time. Shows lifetime savings, an efficiency score, monthly spending cards with budget status, and top expense categories per month. Users can toggle between years to review past performance. This is the analytical counterpart to the dashboard — the dashboard shows "now", history shows "over time".

## User Stories

- As a user, I want to see total lifetime savings so that I can track our long-term financial progress
- As a user, I want to see an efficiency score so that I know how well we stay within budget
- As a user, I want to browse monthly spending summaries so that I can spot trends
- As a user, I want to see top spending categories per month so that I can identify what drives costs
- As a user, I want to toggle between years so that I can compare year-over-year performance

## UI Screens

- **Stitch project**: `1549972375507522114` (Couple Budget Tracker)
- `52905a30f4e84701a170b22c3d990619` — **Historical Trends**: Lifetime savings total, efficiency score, year toggle (2024/2023), monthly breakdown cards with status badges, top expense categories per month

## UI Components

### Header
- Couple portrait / avatars
- Notifications icon

### Lifetime Metrics
- **Total Shared Savings**: Large dollar figure (e.g. "$42,850.00")
  - Calculated as: total income - total expenses (all time)
- **Efficiency Score**: Percentage (e.g. "94%")
  - Calculated as: months under budget / total months × 100

### Year Selector
- Toggle between years (e.g. 2024 | 2023)
- Shows data for selected year

### Monthly Breakdown Cards
- One card per month (reverse chronological)
- Each card shows:
  - Month and year (e.g. "July 2024")
  - Status badge: "Under Budget" (green), "Budget exceeded" (red), "On track" (neutral)
  - Spent amount vs. budget (e.g. "$3,420 of $4,000")
- Cards are expandable to show top expense categories

### Expense Categories (expanded month)
- Top 3 categories for that month:
  - Category name
  - Amount spent (e.g. "Mortgage & Rent: $1,800.00")

### Bottom Navigation
- Dashboard, **History** (active), Add, Categories, Settings

## Data Model

No new tables. This feature queries `transactions`, `categories`, and `budgets`.

**Key queries**:
1. **Lifetime savings**: SUM(income) - SUM(expenses) across all transactions
2. **Efficiency score**: Count months where total expenses <= total category budgets
3. **Monthly breakdown**: GROUP BY year/month, SUM amounts, compare to monthly budget total
4. **Top categories per month**: GROUP BY category within each month, ORDER BY amount DESC LIMIT 3

## Server Actions

### `getHistoricalData`
- **Input**: `{ budgetId: string, year: number }`
- **Output**:
  ```typescript
  {
    lifetimeSavings: number
    efficiencyScore: number  // 0-100
    months: Array<{
      year: number
      month: number
      spent: number
      budgeted: number
      status: "under_budget" | "over_budget" | "on_track"
      topCategories: Array<{
        name: string
        icon: string
        amount: number
      }>
    }>
  }
  ```
- **Auth**: Required (budget member)
- **Flow**: Aggregate transactions by month for the given year, calculate totals and statuses

### `getAvailableYears`
- **Input**: `{ budgetId: string }`
- **Output**: `Array<number>` — years that have transaction data
- **Auth**: Required (budget member)

## Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/history` | Historical trends page | Required, budget member |

## Acceptance Criteria

- [x] Lifetime savings shows total income minus total expenses
- [x] Efficiency score shows percentage of months where spending was within budget
- [x] Year selector toggles between available years
- [x] Monthly cards display in reverse chronological order (most recent first)
- [x] Each monthly card shows: month name, spent vs. budgeted, status badge
- [x] Status badges use correct colors: green (under budget), red (exceeded), neutral (on track)
- [x] "On track" status applies when spending is within 10% of budget
- [x] Expanding a month card shows top 3 expense categories with amounts
- [x] Amounts are formatted in the budget's currency
- [x] Empty state: friendly message when no historical data exists
- [x] Year selector only shows years with transaction data
- [x] Both partners' transactions are included in all calculations

## Out of Scope

- Line charts or bar graphs (keep it card-based as per design)
- Export to CSV/PDF
- Comparison between partners' spending
- Budget projections / forecasting
- Monthly budget snapshots (uses current category budgets for comparison)
