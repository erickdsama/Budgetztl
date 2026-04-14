-- Fix infinite recursion in budget_members RLS policy
-- The SELECT policy on budget_members referenced budget_members itself,
-- causing infinite recursion. Fix: use a SECURITY DEFINER function that
-- bypasses RLS to get the user's budget IDs.

-- 1. Create a helper function that bypasses RLS
create or replace function public.get_user_budget_ids()
returns setof uuid as $$
  select budget_id from public.budget_members where user_id = auth.uid();
$$ language sql security definer stable;

-- 2. Drop the recursive policy
drop policy if exists "Members can see co-members" on public.budget_members;

-- 3. Recreate with the helper function (no recursion)
create policy "Members can see co-members"
  on public.budget_members for select
  using (budget_id in (select public.get_user_budget_ids()));

-- 4. Also update all other policies that subquery budget_members
--    to use the helper function (not strictly required but more efficient)

-- Profiles: reading budget members' profiles
drop policy if exists "Users can read budget members profiles" on public.profiles;
create policy "Users can read budget members profiles"
  on public.profiles for select
  using (
    id in (
      select user_id from public.budget_members
      where budget_id in (select public.get_user_budget_ids())
    )
  );

-- Budgets: members can read
drop policy if exists "Members can read their budgets" on public.budgets;
create policy "Members can read their budgets"
  on public.budgets for select
  using (id in (select public.get_user_budget_ids()));

-- Categories: all 4 policies
drop policy if exists "Members can read budget categories" on public.categories;
create policy "Members can read budget categories"
  on public.categories for select
  using (budget_id in (select public.get_user_budget_ids()));

drop policy if exists "Members can create categories" on public.categories;
create policy "Members can create categories"
  on public.categories for insert
  with check (budget_id in (select public.get_user_budget_ids()));

drop policy if exists "Members can update categories" on public.categories;
create policy "Members can update categories"
  on public.categories for update
  using (budget_id in (select public.get_user_budget_ids()));

drop policy if exists "Members can delete categories" on public.categories;
create policy "Members can delete categories"
  on public.categories for delete
  using (budget_id in (select public.get_user_budget_ids()));

-- Transactions: read + insert
drop policy if exists "Members can read budget transactions" on public.transactions;
create policy "Members can read budget transactions"
  on public.transactions for select
  using (budget_id in (select public.get_user_budget_ids()));

drop policy if exists "Members can create transactions" on public.transactions;
create policy "Members can create transactions"
  on public.transactions for insert
  with check (
    auth.uid() = user_id
    and budget_id in (select public.get_user_budget_ids())
  );
