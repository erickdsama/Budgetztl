# Feature: Categories & Budget Allocation

## Overview

Categories organize spending into buckets (Groceries, Rent, Dining Out, etc.) with monthly budget limits per category. Users can create custom categories with icons and set how much they plan to spend each month. The projected monthly total helps couples see their total budget at a glance. Categories are shared across the budget — both partners use the same category set.

## User Stories

- As a user, I want to see all my budget categories with their monthly limits so that I understand our spending plan
- As a user, I want to create new categories with custom names and icons so that I can organize spending my way
- As a user, I want to set a monthly budget per category so that I can control spending in each area
- As a user, I want to see the projected monthly total so that I know our overall budget commitment
- As a couple, we want shared categories so that both partners categorize spending consistently

## UI Screens

- **Stitch project**: `1549972375507522114` (Couple Budget Tracker)
- `e9b381c189bf4beba8987564b64d188d` — **Category Setup**: List of categories with type labels (Household, Lifestyle, Fixed Costs), monthly plan amounts, "Add New Category" button, projected monthly total ("$1,890 / month")
- `164a33e12f7d455fbdbc37817a7ea3c4` — **Add Category Modal**: Modal with icon selector (10 icons), category name input, monthly budget input, "Create Category" button

## UI Components

### Category List
- Each card shows:
  - Icon (from icon set)
  - Category name (e.g. "Groceries")
  - Type label (e.g. "Household", "Lifestyle", "Fixed Costs")
  - Monthly budget amount (e.g. "$1,200")
- Cards are tappable to edit
- "+" button to add new category

### Add/Edit Category Modal
- **Icon selector**: Grid of 10 icons — home, movie, fitness_center, medical_services, pets, school, local_gas_station, style, celebration, more_horiz
- **Category name**: Text input
- **Monthly budget**: Dollar amount input
- **Actions**: "Create Category" / "Save Changes", Cancel

### Projected Monthly Total
- Sum of all category budgets
- Displayed at bottom: e.g. "$1,890 / month"

## Data Model

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `categories` | `id` | `uuid` | PK, DEFAULT gen_random_uuid() |
| `categories` | `budget_id` | `uuid` | NOT NULL, references `budgets(id)` ON DELETE CASCADE |
| `categories` | `name` | `text` | NOT NULL, e.g. "Groceries" |
| `categories` | `icon` | `text` | NOT NULL, Material icon name (e.g. "shopping_basket") |
| `categories` | `type` | `text` | NULL, label like "Household", "Lifestyle", "Fixed Costs" |
| `categories` | `monthly_budget` | `numeric(12,2)` | NOT NULL, >= 0 |
| `categories` | `sort_order` | `integer` | NOT NULL DEFAULT 0, for custom ordering |
| `categories` | `created_at` | `timestamptz` | NOT NULL DEFAULT now() |

**Default categories** (seeded on budget creation):
1. Groceries (shopping_basket, Household, $1,200)
2. Dining Out (restaurant, Lifestyle, $500)
3. Utilities (bolt, Fixed Costs, $300)
4. Rent & Bills (home, Fixed Costs, $2,400)
5. Transport (commute, Household, $200)
6. Entertainment (movie, Lifestyle, $150)
7. Health (medical_services, Household, $100)
8. Shopping (shopping_bag, Lifestyle, $200)

**RLS Policies (categories)**:
- SELECT: Budget members can read categories in their budget
- INSERT: Budget members can create categories in their budget
- UPDATE: Budget members can update categories in their budget
- DELETE: Budget members can delete categories (only if no transactions reference it)

## Server Actions

### `createCategory`
- **Input**:
  ```typescript
  {
    budgetId: string
    name: string           // 1-50 chars
    icon: string           // Material icon name
    type?: string          // optional label
    monthlyBudget: number  // >= 0
  }
  ```
- **Output**: `{ id: string }`
- **Auth**: Required (budget member)
- **Errors**: Duplicate name in same budget, name empty, budget negative

### `updateCategory`
- **Input**: `{ id: string, name?: string, icon?: string, type?: string, monthlyBudget?: number }`
- **Output**: `{ success: boolean }`
- **Auth**: Required (budget member)

### `deleteCategory`
- **Input**: `{ id: string }`
- **Output**: `{ success: boolean }`
- **Auth**: Required (budget member)
- **Errors**: Category has existing transactions (must reassign first)

### `getCategories`
- **Input**: `{ budgetId: string }`
- **Output**: `Array<Category>` ordered by `sort_order`
- **Auth**: Required (budget member)

### `seedDefaultCategories`
- **Input**: `{ budgetId: string }`
- **Output**: `{ count: number }`
- **Auth**: Internal (called during budget creation)
- **Flow**: Insert the 8 default categories for a new budget

## Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/categories` | Category list with budget allocations | Required, budget member |

## Acceptance Criteria

- [x] Category list displays all categories with icons, names, types, and monthly budgets
- [x] "Add New Category" button opens modal
- [x] Modal shows icon selector grid with 10+ icons
- [x] Category name and monthly budget are required fields
- [x] Projected monthly total (sum of all category budgets) displays at the bottom
- [x] Creating a new category updates the projected total immediately
- [x] Tapping a category card opens edit mode (same modal, pre-filled)
- [x] Categories can be deleted if they have no transactions
- [ ] Deleting a category with transactions shows an error / asks to reassign
- [x] Default categories are seeded when a budget is first created
- [x] Both budget members see the same categories
- [ ] Category changes are reflected on the dashboard immediately
- [x] Icon selector shows Material icons matching the Stitch design

## Out of Scope

- Category color customization
- Subcategories
- Category archiving (soft delete)
- Drag-and-drop reordering
- Per-member category budgets (categories are shared)
