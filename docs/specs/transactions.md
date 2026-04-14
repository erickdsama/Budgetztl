# Feature: Transactions (Add Expense / Income)

## Overview

The core financial data entry feature. Users can add expenses or income with an amount, category, date, and optional notes. Each transaction is attributed to the user who created it and belongs to the shared budget. This is the most frequently used feature — it must be fast and frictionless.

## User Stories

- As a user, I want to add an expense with amount, category, and date so that my spending is tracked
- As a user, I want to add income so that the budget reflects our earnings
- As a user, I want to toggle between expense and income so that I can enter either type quickly
- As a user, I want to select from predefined categories so that entries are consistently categorized
- As a user, I want to add optional notes to a transaction so that I remember what it was for
- As a user, I want the date to default to today so that most entries require minimal input

## UI Screens

- **Stitch project**: `1549972375507522114` (Couple Budget Tracker)
- `19048ad9d66a42bb896a4ad354c3fadf` — **Add Expense/Income**: Full transaction form with amount, expense/income toggle, category selector (8 icons), date picker, notes field, "Confirm Entry" button
- `8b06810f36a54e828c40214965d0f593` — **Add Income Screen**: Income-specific variant with amount and category

## UI Components

### Amount Input
- Large numeric input with currency prefix ($)
- Numeric keyboard on mobile

### Transaction Type Toggle
- Binary selector: **Expense** | **Income**
- Expense selected by default
- Toggle changes the category list and form styling

### Category Selector
- Grid of category icons with labels
- Default expense categories: Restaurant, Commute, Rent, Shopping, Health, Bills, Fun, More
- "More" opens full category list
- Category is required

### Date Picker
- Default: "Today, {formatted date}"
- Edit button opens date picker
- Cannot select future dates

### Notes Field
- Optional text input: "Add Details"
- Max 500 characters

### Actions
- "Confirm Entry" — primary button, submits the transaction
- "Close" — dismiss/cancel

## Data Model

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `transactions` | `id` | `uuid` | PK, DEFAULT gen_random_uuid() |
| `transactions` | `budget_id` | `uuid` | NOT NULL, references `budgets(id)` ON DELETE CASCADE |
| `transactions` | `user_id` | `uuid` | NOT NULL, references `profiles(id)` |
| `transactions` | `category_id` | `uuid` | NOT NULL, references `categories(id)` |
| `transactions` | `type` | `text` | NOT NULL, one of: expense, income |
| `transactions` | `amount` | `numeric(12,2)` | NOT NULL, always positive (type determines sign) |
| `transactions` | `description` | `text` | NULL, optional notes (max 500 chars) |
| `transactions` | `date` | `date` | NOT NULL DEFAULT CURRENT_DATE |
| `transactions` | `created_at` | `timestamptz` | NOT NULL DEFAULT now() |

**Indexes**:
- `idx_transactions_budget_date` ON `transactions(budget_id, date DESC)` — for dashboard and history queries
- `idx_transactions_budget_category` ON `transactions(budget_id, category_id)` — for category breakdown

**RLS Policies (transactions)**:
- SELECT: Budget members can read all transactions in their budget
- INSERT: Budget members can insert transactions into their budget
- UPDATE: Users can only update their own transactions
- DELETE: Users can only delete their own transactions

## Server Actions

### `createTransaction`
- **Input**:
  ```typescript
  {
    budgetId: string
    categoryId: string
    type: "expense" | "income"
    amount: number        // positive, > 0
    description?: string  // max 500 chars
    date: string          // ISO date, <= today
  }
  ```
- **Output**: `{ id: string }`
- **Auth**: Required (budget member)
- **Flow**: Validate inputs → insert `transactions` row → revalidate dashboard path → return transaction ID
- **Errors**: Amount <= 0, future date, invalid category, user not a budget member

### `updateTransaction`
- **Input**: `{ id: string, ...partial fields }`
- **Output**: `{ success: boolean }`
- **Auth**: Required (transaction owner only)

### `deleteTransaction`
- **Input**: `{ id: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Required (transaction owner only)

### `getTransactionsByMonth`
- **Input**: `{ budgetId: string, year: number, month: number }`
- **Output**: `Array<Transaction>` ordered by date DESC
- **Auth**: Required (budget member)

## Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/transactions/new` | Add expense/income form | Required, budget member |
| `/transactions/[id]/edit` | Edit existing transaction | Required, transaction owner |

## Acceptance Criteria

- [x] Users can add an expense with amount, category, and date
- [x] Users can add income with amount, category, and date
- [x] Expense/Income toggle switches the transaction type
- [x] Amount input accepts only positive numbers with up to 2 decimal places
- [x] Category selector shows relevant icons in a grid layout
- [x] Selecting "More" shows the full category list
- [x] Date defaults to today and cannot be set to a future date
- [x] Notes field is optional, max 500 characters
- [x] "Confirm Entry" saves the transaction and navigates back to dashboard
- [x] Dashboard data updates after adding a transaction
- [x] Transaction is attributed to the current user (shown in recent activity)
- [x] Currency symbol matches the budget's currency setting
- [x] Form validation shows errors for: empty amount, no category selected
- [ ] Users can edit their own transactions
- [x] Users can delete their own transactions
- [ ] Users cannot edit/delete partner's transactions

## Out of Scope

- Recurring transactions (automatic monthly entries)
- Receipt photo upload
- Transaction splitting between partners
- Bulk import from bank statements
- Transaction search/filter (handled by History feature)
