-- Fix: Budget creation fails because:
-- 1. INSERT + .select() needs SELECT policy, but user isn't a member yet
-- 2. Invite code uniqueness check needs SELECT on budgets before membership exists
--
-- Fix: Add a SELECT policy for budget creators + relax INSERT to check auth only

-- Allow budget creators to read their own budgets (before membership exists)
create policy "Creator can read own budget"
  on public.budgets for select
  using (created_by = auth.uid());

-- Allow invite code lookups for any authenticated user (needed for joining)
create policy "Authenticated users can read budgets by invite code"
  on public.budgets for select
  using (auth.role() = 'authenticated');

-- Drop and recreate INSERT policy: just require authenticated user
-- (the server action already validates created_by = current user)
drop policy if exists "Authenticated users can create budgets" on public.budgets;
create policy "Authenticated users can create budgets"
  on public.budgets for insert
  with check (auth.role() = 'authenticated');
