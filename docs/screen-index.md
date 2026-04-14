# Screen Index

Maps each folder in `stitch_couple_budget_tracker/` to the app route it corresponds to and a short description.

## How to use

- **PM Agent**: reference relevant folder(s) in specs under `## UI Screens`
- **Dev Agent**: read `screen.png` + `code.html` when building a feature
- **Visual Diff Agent**: look up the route → folder mapping to navigate + screenshot the right page

> **Palette note**: The Stitch screens were generated across two different color systems.
> The canonical palette is **Blue** (`#475f8a`). Screens marked 🟢 match it.
> Screens marked 🟡 used the old Teal palette (`#006769`) — use them for layout/structure only; apply blue tokens when implementing.

---

## Screen Reference

| Folder | Route | Palette | Description |
|--------|-------|---------|-------------|
| `login_register` | `/login` | 🟢 Blue `#475f8a` | Login and registration screen with email/password fields |
| `create_account_1` | `/login` (step 1) | 🟢 Blue `#475f8a` | Account creation — basic info (name, email) |
| `create_account_2` | `/login` (step 2) | 🟢 Blue `#475f8a` | Account creation — password and confirmation |
| `join_or_create_budget_1` | `/onboarding` (step 1) | 🟡 Teal `#006769` | Onboarding choice: join an existing budget or create a new one |
| `join_or_create_budget_2` | `/onboarding` (step 2) | 🟡 Teal `#006769` | Joining a budget — enter invite code |
| `join_or_create_budget_3` | `/onboarding` (step 3) | 🟢 Blue `#475f8a` | Joining a budget — confirmation |
| `join_a_budget` | `/onboarding/join` | 🟢 Blue `#475f8a` | Full join-a-budget flow screen |
| `create_new_budget_1` | `/onboarding/create` (step 1) | 🟡 Teal `#006769` | New budget — name and currency |
| `create_new_budget_2` | `/onboarding/create` (step 2) | 🟡 Teal `#006769` | New budget — monthly income |
| `create_new_budget_3` | `/onboarding/create` (step 3) | 🟡 Teal `#006769` | New budget — budget period |
| `create_new_budget_4` | `/onboarding/create` (step 4) | 🟡 Teal `#006769` | New budget — savings goal |
| `create_new_budget_5` | `/onboarding/create` (step 5) | 🟡 Teal `#006769` | New budget — invite partner |
| `create_new_budget_6` | `/onboarding/create` (step 6) | 🟡 Teal `#006769` | New budget — review and confirm |
| `dashboard` | `/dashboard` | 🟡 Teal `#006769` | Main dashboard — balance overview, recent transactions, budget summary |
| `vibrant_dashboard` | `/dashboard` | 🟢 Blue `#475f8a` | Alternative vibrant dashboard design |
| `financial_harmony_app` | `/dashboard` | 🟡 Teal `#006769` | Full app layout with sidebar navigation |
| `harmonize_ui` | `/dashboard` | — no code.html | Harmonized full-app UI layout |
| `add_expense_income` | `/transactions/new` | 🟢 Blue `#475f8a` | Add transaction form — expense or income, amount, category, date |
| `add_income_screen` | `/transactions/new?type=income` | 🟢 Blue `#475f8a` | Add income screen — focused income entry |
| `redesigned_add_income_screen` | `/transactions/new?type=income` | 🟡 Teal `#006769` | Redesigned income entry screen |
| `category_budgeting` | `/categories` | 🟡 Teal `#006769` | Category list with budget allocation per category |
| `category_setup_with_icons` | `/categories/setup` | 🟡 Teal `#006769` | Category setup with icon picker |
| `category_setup_with_modal_1` | `/categories/setup` | — unknown | Category setup — modal step 1 |
| `category_setup_with_modal_2` | `/categories/setup` | 🟢 Blue `#475f8a` | Category setup — modal step 2 |
| `category_setup_with_modal_3` | `/categories/setup` | ⚠️ Cyan `#00CCCC` | Category setup — modal step 3 |
| `category_setup_with_modal_4` | `/categories/setup` | ⚠️ Dark `#1e293b` | Category setup — modal step 4 |
| `category_setup_with_modal_5` | `/categories/setup` | 🟢 Blue `#475f8a` | Category setup — modal step 5 |
| `category_setup_with_modal_6` | `/categories/setup` | 🟢 Blue `#475f8a` | Category setup — modal step 6 |
| `category_setup_with_modal_7` | `/categories/setup` | 🟢 Blue `#475f8a` | Category setup — modal step 7 (final) |
| `redesigned_category_setup` | `/categories/setup` | 🟡 Teal `#006769` | Redesigned category setup flow |
| `add_category_modal` | `/categories` (modal) | 🟢 Blue `#475f8a` | Modal for adding a new category inline |
| `historical_trends_1` | `/history` | ⚠️ GitHub blue `#2f81f7` | Historical trends — monthly overview chart |
| `historical_trends_2` | `/history` | — unknown | Historical trends — category breakdown over time |
| `historical_trends_3` | `/history` | 🟢 Blue `#475f8a` | Historical trends — savings trend |
| `settings` | `/settings` | 🟢 Blue `#475f8a` | User settings — profile, notifications, currency, partner management |
| `my_design_system` | N/A | — | Design system reference — colors, typography, spacing tokens |

---

## Canonical Design System Tokens

Source: `stitch_couple_budget_tracker/my_design_system/DESIGN.md` + `login_register/code.html`

| Token | Value | Notes |
|-------|-------|-------|
| Primary | `#475f8a` | Blue-slate. Used in `globals.css` as `--primary` |
| Primary container | `#b3cdfe` | Light blue |
| Primary hover | `#344d77` | Darker blue for hover states |
| Secondary | `#565f72` | Blue-grey |
| Secondary container | `#dae2f9` | Light blue-grey |
| Tertiary | `#675882` | Soft purple |
| Background | `#f9f9fe` | Cool near-white |
| Surface | `#f9f9fe` | Same as background |
| On-surface | `#2f323a` | Near-black text |
| Outline | `#777a84` | Borders and dividers |
| Error | `#a83836` | Red |
| Font family | Inter | All text |
| Border radius | `8px` (`rounded-lg`) | Default roundness |
| Color mode | Light | |

> When implementing a 🟡 Teal screen, copy its **layout and structure** but substitute all
> teal color values with the canonical blue tokens above.
