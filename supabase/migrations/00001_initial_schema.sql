-- BudgetZTL Initial Schema Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
--
-- Structure: All tables first, then triggers, then RLS policies, then indexes

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1. Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  preferences jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is 'App-specific user profile data, extends auth.users';

-- 2. Budgets
create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text not null default 'USD' check (currency in ('USD', 'EUR', 'GBP', 'JPY', 'MXN')),
  invite_code text unique not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);
comment on table public.budgets is 'Shared budget containers for couples';

-- 3. Budget Members
create table public.budget_members (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  unique (budget_id, user_id)
);
comment on table public.budget_members is 'Links users to shared budgets (max 2 per budget)';

-- 4. Categories
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  name text not null,
  icon text not null,
  type text,
  monthly_budget numeric(12,2) not null check (monthly_budget >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (budget_id, name)
);
comment on table public.categories is 'Budget spending categories with monthly limits';

-- 5. Transactions
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.budgets(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  category_id uuid not null references public.categories(id),
  type text not null check (type in ('expense', 'income')),
  amount numeric(12,2) not null check (amount > 0),
  description text check (char_length(description) <= 500),
  date date not null default current_date,
  created_at timestamptz not null default now()
);
comment on table public.transactions is 'Individual expense and income entries';

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Helper to get current user's budget IDs (bypasses RLS to avoid recursion)
create or replace function public.get_user_budget_ids()
returns setof uuid as $$
  select budget_id from public.budget_members where user_id = auth.uid();
$$ language sql security definer stable;

-- Auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'User'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enforce max 2 members per budget
create or replace function public.check_budget_member_limit()
returns trigger as $$
begin
  if (select count(*) from public.budget_members where budget_id = new.budget_id) >= 2 then
    raise exception 'Budget already has maximum number of members (2)';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_budget_member_limit
  before insert on public.budget_members
  for each row execute function public.check_budget_member_limit();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Profiles
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can read budget members profiles"
  on public.profiles for select
  using (
    id in (
      select user_id from public.budget_members
      where budget_id in (select public.get_user_budget_ids())
    )
  );

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Budgets
alter table public.budgets enable row level security;

create policy "Members can read their budgets"
  on public.budgets for select
  using (id in (select public.get_user_budget_ids()));

create policy "Authenticated users can read budgets"
  on public.budgets for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create budgets"
  on public.budgets for insert
  with check (auth.role() = 'authenticated');

create policy "Budget owner can update budget"
  on public.budgets for update
  using (created_by = auth.uid());

-- Budget Members
alter table public.budget_members enable row level security;

create policy "Members can see co-members"
  on public.budget_members for select
  using (budget_id in (select public.get_user_budget_ids()));

create policy "Authenticated users can join budgets"
  on public.budget_members for insert
  with check (auth.uid() = user_id);

create policy "Budget owner can remove members"
  on public.budget_members for delete
  using (
    budget_id in (
      select id from public.budgets
      where created_by = auth.uid()
    )
  );

-- Categories
alter table public.categories enable row level security;

create policy "Members can read budget categories"
  on public.categories for select
  using (budget_id in (select public.get_user_budget_ids()));

create policy "Members can create categories"
  on public.categories for insert
  with check (budget_id in (select public.get_user_budget_ids()));

create policy "Members can update categories"
  on public.categories for update
  using (budget_id in (select public.get_user_budget_ids()));

create policy "Members can delete categories"
  on public.categories for delete
  using (budget_id in (select public.get_user_budget_ids()));

-- Transactions
alter table public.transactions enable row level security;

create policy "Members can read budget transactions"
  on public.transactions for select
  using (budget_id in (select public.get_user_budget_ids()));

create policy "Members can create transactions"
  on public.transactions for insert
  with check (
    auth.uid() = user_id
    and budget_id in (select public.get_user_budget_ids())
  );

create policy "Users can update own transactions"
  on public.transactions for update
  using (user_id = auth.uid());

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (user_id = auth.uid());

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_budget_members_user on public.budget_members(user_id);
create index idx_budget_members_budget on public.budget_members(budget_id);
create index idx_budgets_invite_code on public.budgets(invite_code);
create index idx_categories_budget on public.categories(budget_id, sort_order);
create index idx_transactions_budget_date on public.transactions(budget_id, date desc);
create index idx_transactions_budget_category on public.transactions(budget_id, category_id);
create index idx_transactions_budget_type_date on public.transactions(budget_id, type, date);
