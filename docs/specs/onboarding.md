# Feature: Onboarding (Budget Creation & Joining)

## Overview

After registration, users must either create a new shared budget or join an existing partner's budget using a 6-digit invite code. This is the gateway between authentication and the main app — users cannot access the dashboard without belonging to at least one budget. The flow supports couples managing finances together.

## User Stories

- As a new user, I want to create a shared budget with a name and currency so that I can start tracking expenses
- As a new user, I want to join my partner's existing budget using an invite code so that we can share financial data
- As a user, I want to choose between creating or joining so that I have a clear onboarding path
- As a budget owner, I want to generate an invite code so that my partner can join my budget

## UI Screens

- **Stitch project**: `1549972375507522114` (Couple Budget Tracker)
- `8cb21780fcf74a429903395e9a74f2cc` — **Join or Create Budget**: Fork screen with "Create New Budget" button and "Join with 6-digit code" input
- `a4726fcedde44608915c8da5de54069f` — **Join a Budget**: Numeric keypad for entering 6-digit invite code, help section explaining where to find the code
- `e74069fb993e4726ac47330f2e5f998d` — **Create New Budget**: Form with budget name, currency selector (USD/EUR/GBP/JPY), quick tip

## Data Model

| Table | Column | Type | Notes |
|-------|--------|------|-------|
| `budgets` | `id` | `uuid` | PK, DEFAULT gen_random_uuid() |
| `budgets` | `name` | `text` | NOT NULL, e.g. "Our New Home Fund" |
| `budgets` | `currency` | `text` | NOT NULL DEFAULT 'USD', one of: USD, EUR, GBP, JPY |
| `budgets` | `invite_code` | `text` | UNIQUE, 6-digit numeric string, auto-generated |
| `budgets` | `created_by` | `uuid` | NOT NULL, references `profiles(id)` |
| `budgets` | `created_at` | `timestamptz` | NOT NULL DEFAULT now() |
| `budget_members` | `id` | `uuid` | PK, DEFAULT gen_random_uuid() |
| `budget_members` | `budget_id` | `uuid` | NOT NULL, references `budgets(id)` ON DELETE CASCADE |
| `budget_members` | `user_id` | `uuid` | NOT NULL, references `profiles(id)` ON DELETE CASCADE |
| `budget_members` | `role` | `text` | NOT NULL DEFAULT 'member', one of: owner, member |
| `budget_members` | `joined_at` | `timestamptz` | NOT NULL DEFAULT now() |

**Constraints**:
- UNIQUE (`budget_id`, `user_id`) — a user can only join a budget once
- Maximum 2 members per budget (couple)

**RLS Policies (budgets)**:
- SELECT: Members can read budgets they belong to (via `budget_members`)
- INSERT: Authenticated users can create budgets
- UPDATE: Only the budget owner can update budget details

**RLS Policies (budget_members)**:
- SELECT: Members can see other members of budgets they belong to
- INSERT: Authenticated users can join via valid invite code
- DELETE: Only the budget owner can remove members

## Server Actions

### `createBudget`
- **Input**: `{ name: string, currency: "USD" | "EUR" | "GBP" | "JPY" }`
- **Output**: `{ budgetId: string, inviteCode: string }`
- **Auth**: Required
- **Flow**: Generate 6-digit invite code → insert `budgets` row → insert `budget_members` row (role: owner) → redirect to `/dashboard`
- **Errors**: Budget name empty, user already owns a budget

### `joinBudget`
- **Input**: `{ inviteCode: string }`
- **Output**: `{ budgetId: string, budgetName: string }`
- **Auth**: Required
- **Flow**: Lookup budget by invite code → verify budget has < 2 members → insert `budget_members` row (role: member) → redirect to `/dashboard`
- **Errors**: Invalid code, budget full (already 2 members), already a member

### `generateInviteCode`
- **Input**: `{ budgetId: string }`
- **Output**: `{ inviteCode: string }`
- **Auth**: Required (budget owner only)
- **Flow**: Generate new 6-digit code → update `budgets.invite_code` → return code

## Routes

| Route | Purpose | Auth |
|-------|---------|------|
| `/onboarding` | Fork: create or join | Required, no budget |
| `/onboarding/create` | Create new budget form | Required, no budget |
| `/onboarding/join` | Join with invite code | Required, no budget |

## Acceptance Criteria

- [x] After registration, user lands on `/onboarding` with two options
- [x] "Create New Budget" navigates to budget creation form
- [x] Budget creation form has name field and currency selector (USD, EUR, GBP, JPY)
- [x] Creating a budget generates a 6-digit invite code automatically
- [x] After creating a budget, user is redirected to `/dashboard`
- [x] "Join with code" shows a numeric keypad for 6-digit code entry
- [x] Valid invite code joins the user to the partner's budget
- [x] Invalid invite code shows an error message
- [x] Full budget (2 members) shows appropriate error
- [x] Help section explains where to find the invite code
- [x] Quick tip appears on the create budget form
- [x] Users without a budget are always redirected to `/onboarding`
- [x] Users with a budget are redirected away from `/onboarding` to `/dashboard`

## Out of Scope

- Multiple budgets per user (only one budget at a time)
- Budget deletion
- Changing budget currency after creation
- More than 2 members per budget
