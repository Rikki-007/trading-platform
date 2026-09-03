-- ============================================================================
-- Meridian — initial schema
--
-- Run this against your Supabase project (SQL Editor, or `supabase db push`
-- with the Supabase CLI). Every table has Row Level Security enabled with a
-- "users can only touch their own rows" policy — server code that needs to
-- act on behalf of the platform (webhooks, admin broadcast) uses the
-- service-role client (src/lib/supabase/server.js getSupabaseAdminClient),
-- which bypasses RLS by design.
-- ============================================================================

-- ---------------------------------------------------------------- profiles --
-- One row per authenticated user. Created automatically on signup by the
-- trigger at the bottom of this file — never insert into this table from
-- application code.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  tier text not null default 'standard' check (tier in ('standard', 'pro')),
  -- Grant manually (SQL editor) to the accounts that should be able to host
  -- video rooms and post trade broadcasts. Never settable by a user.
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- The policy above lets a user UPDATE their own row, but says nothing about
-- *which columns* — without this trigger, a user could set is_admin = true
-- on themselves via a normal client-side .update() call. This trigger
-- forces is_admin and tier back to their previous value on any update that
-- doesn't come from the service-role key (which the Stripe webhook /
-- promo-redemption routes use to grant tier upgrades legitimately).
create or replace function public.protect_profile_privileges()
returns trigger as $$
begin
  if auth.role() <> 'service_role' then
    new.is_admin := old.is_admin;
    new.tier := old.tier;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute function public.protect_profile_privileges();

-- ------------------------------------------------------------------ wallet --
-- One row per user. `practice_balance_cents` is the free paper-trading
-- balance ($100,000 on signup, matching the v1 in-memory demo). `live_balance_cents`
-- is the funded-tier ledger — see the compliance note in
-- src/app/api/stripe/webhook/route.js before this ever represents real,
-- spendable money: today it is only ever credited in Stripe *test* mode.
create table if not exists public.wallets (
  user_id uuid primary key references auth.users (id) on delete cascade,
  practice_balance_cents bigint not null default 10000000, -- $100,000.00
  live_balance_cents bigint not null default 0,
  live_currency text not null default 'eur',
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;

create policy "wallets: read own" on public.wallets
  for select using (auth.uid() = user_id);
-- No update/insert policy for regular users — balances only change via
-- server-side code (trade execution, the Stripe webhook) using the
-- service-role client, which bypasses RLS. This is deliberate: a balance
-- a client could write directly is a balance a client could forge.

-- --------------------------------------------------------------- positions --
create table if not exists public.positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('practice', 'live')),
  symbol text not null,
  qty numeric not null check (qty >= 0),
  avg_cost_cents bigint not null,
  updated_at timestamptz not null default now(),
  unique (user_id, account_type, symbol)
);

alter table public.positions enable row level security;

create policy "positions: read own" on public.positions
  for select using (auth.uid() = user_id);

-- ------------------------------------------------------------------ trades --
-- Append-only fill log — the source of truth. `positions` is a derived/
-- materialized view maintained alongside it, mirroring how the original
-- in-memory MarketProvider separated "the fill happened" from "the
-- resulting position" (see PLATFORM_REPORT.md's architecture notes).
create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_type text not null check (account_type in ('practice', 'live')),
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  qty numeric not null check (qty > 0),
  price_cents bigint not null,
  created_at timestamptz not null default now()
);

alter table public.trades enable row level security;

create policy "trades: read own" on public.trades
  for select using (auth.uid() = user_id);

create index if not exists trades_user_created_idx on public.trades (user_id, created_at desc);

-- ------------------------------------------------------------- promo_codes --
create table if not exists public.promo_codes (
  code text primary key,
  description text,
  bonus_practice_cents bigint not null default 0,
  grants_tier text check (grants_tier in ('standard', 'pro')),
  max_redemptions integer,
  redemption_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;
-- No public select policy — codes are validated server-side (route handler
-- using the service-role client) so a client can't enumerate valid codes by
-- reading the table directly.

create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  code text not null references public.promo_codes (code),
  redeemed_at timestamptz not null default now(),
  unique (user_id, code)
);

alter table public.promo_redemptions enable row level security;

create policy "promo_redemptions: read own" on public.promo_redemptions
  for select using (auth.uid() = user_id);

-- Seed the promo code named in the Phase 2 brief.
insert into public.promo_codes (code, description, bonus_practice_cents, max_redemptions)
values ('STARTBOOST', 'Launch promo — bonus practice-tier equity', 2500000, null)
on conflict (code) do nothing;

-- --------------------------------------------------------------- deposits --
-- One row per Stripe checkout session, independent of the wallet balance —
-- this is the audit trail the wallet update is derived from, and it's how
-- the webhook stays idempotent (see route.js: it upserts by
-- stripe_session_id, so a retried webhook delivery can't double-credit).
create table if not exists public.deposits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_session_id text not null unique,
  amount_cents bigint not null,
  currency text not null default 'eur',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  live_mode boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.deposits enable row level security;

create policy "deposits: read own" on public.deposits
  for select using (auth.uid() = user_id);

-- ------------------------------------------------------------- broadcasts --
-- Trade-broadcast notifications. NOTIFY-ONLY BY DESIGN — inserting a row
-- here alerts subscribers; it never places an order in anyone else's
-- account. See MERIDIAN_PHASE2_REPORT.md Section 3.3 for why that
-- distinction is load-bearing, not stylistic.
create table if not exists public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users (id),
  symbol text not null,
  side text not null check (side in ('buy', 'sell')),
  qty numeric not null check (qty > 0),
  price_cents bigint not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.broadcasts enable row level security;

create policy "broadcasts: read all (authenticated)" on public.broadcasts
  for select to authenticated using (true);
-- No insert policy for regular users — only the admin route (service-role
-- client, with its own is_admin check against profiles) can create one.

alter publication supabase_realtime add table public.broadcasts;

-- ---------------------------------------------------------- signup trigger --
-- Creates a profile + starting wallet the moment a new auth user exists, so
-- application code never has to remember to do it.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);

  insert into public.wallets (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
