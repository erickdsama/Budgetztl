-- Fix 1: Add MXN to allowed currencies
alter table public.budgets drop constraint if exists budgets_currency_check;
alter table public.budgets add constraint budgets_currency_check
  check (currency in ('USD', 'EUR', 'GBP', 'JPY', 'MXN'));

-- Fix 2: Backfill missing profiles for existing auth users
-- This handles users who signed up before the handle_new_user trigger existed
insert into public.profiles (id, full_name, avatar_url)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', 'User'),
  u.raw_user_meta_data ->> 'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
