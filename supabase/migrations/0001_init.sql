-- ============================================================================
-- DexLedger: Initial schema
-- Multi-tenant SaaS for inventory, customers, credit/udhaar ledger tracking.
--
-- Architecture notes:
--   - Single shared schema. Every tenant-owned table carries a `store_id`.
--   - Row Level Security (RLS) enforces tenant isolation on every table.
--   - Outstanding balances are NEVER stored - always derived from
--     ledger_entries via the `customer_balances` view.
--   - `auth.uid()` maps 1:1 to `public.users.id` (mirrored from Supabase Auth).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type business_type as enum (
  'pharmacy',
  'grocery_store',
  'hardware_store',
  'stationery_shop',
  'cement_supplier',
  'distributor',
  'warehouse',
  'other'
);

create type ledger_entry_type as enum ('purchase', 'payment');

create type activity_type as enum (
  'product_added',
  'product_updated',
  'product_deleted',
  'stock_adjusted',
  'customer_added',
  'customer_updated',
  'customer_deleted',
  'ledger_purchase',
  'ledger_payment',
  'report_generated',
  'whatsapp_sent',
  'settings_updated'
);

-- WhatsApp providers are intentionally an open text field (not enum) so new
-- providers can be added without a migration. Validated at the app layer.
-- Suggested values: 'meta_whatsapp', 'twilio', 'interakt'.

-- ----------------------------------------------------------------------------
-- users
-- Mirrors auth.users. Populated automatically via trigger on signup.
-- ----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  created_at timestamptz not null default now()
);

comment on table public.users is 'Mirrors auth.users; one row per registered account.';

-- ----------------------------------------------------------------------------
-- stores
-- One row per tenant/business. owner_id is the primary admin user.
-- ----------------------------------------------------------------------------
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  store_name text not null,
  store_type business_type not null default 'other',
  phone_number text,
  whatsapp_number text,
  inventory_enabled boolean not null default true,
  credit_enabled boolean not null default true,
  expiry_enabled boolean not null default false,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.stores is 'Tenant root. Every business-scoped table references stores.id via store_id.';

create index stores_owner_id_idx on public.stores (owner_id);

-- ----------------------------------------------------------------------------
-- products (Inventory module)
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  category text,
  quantity numeric not null default 0,
  low_stock_threshold numeric not null default 0,
  expiry_date date,
  unit text,
  price numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_quantity_nonnegative check (quantity >= 0),
  constraint products_threshold_nonnegative check (low_stock_threshold >= 0)
);

create index products_store_id_idx on public.products (store_id);
create index products_store_low_stock_idx on public.products (store_id) where quantity <= low_stock_threshold;
create index products_store_expiry_idx on public.products (store_id, expiry_date) where expiry_date is not null;

-- ----------------------------------------------------------------------------
-- customers (Customer module)
-- ----------------------------------------------------------------------------
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now()
);

create index customers_store_id_idx on public.customers (store_id);
create index customers_store_name_idx on public.customers (store_id, name);

-- ----------------------------------------------------------------------------
-- ledger_entries (Credit/Udhaar module)
-- Outstanding balance = sum(purchase) - sum(payment). Never stored directly.
-- ----------------------------------------------------------------------------
create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  type ledger_entry_type not null,
  amount numeric(12, 2) not null,
  description text,
  created_at timestamptz not null default now(),
  constraint ledger_entries_amount_positive check (amount > 0)
);

create index ledger_entries_store_id_idx on public.ledger_entries (store_id);
create index ledger_entries_customer_id_idx on public.ledger_entries (customer_id);
create index ledger_entries_store_customer_idx on public.ledger_entries (store_id, customer_id);

-- ----------------------------------------------------------------------------
-- activities (audit / recent activity feed)
-- ----------------------------------------------------------------------------
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  activity_type activity_type not null,
  description text not null,
  created_at timestamptz not null default now()
);

create index activities_store_id_created_idx on public.activities (store_id, created_at desc);

-- ----------------------------------------------------------------------------
-- notification_settings (WhatsApp / reporting preferences)
-- One-to-one with stores. Kept separate so future channels (SMS, email) can
-- be added without bloating the stores table.
-- ----------------------------------------------------------------------------
create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null unique references public.stores(id) on delete cascade,
  whatsapp_enabled boolean not null default false,
  whatsapp_provider text,
  low_stock_alerts boolean not null default true,
  daily_summary boolean not null default false,
  weekly_summary boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Derived views
-- ============================================================================

-- Customer outstanding balances, computed from ledger_entries.
-- Never store this value - always derive it.
create or replace view public.customer_balances as
select
  c.id as customer_id,
  c.store_id,
  coalesce(sum(le.amount) filter (where le.type = 'purchase'), 0) as total_purchases,
  coalesce(sum(le.amount) filter (where le.type = 'payment'), 0) as total_payments,
  coalesce(sum(le.amount) filter (where le.type = 'purchase'), 0)
    - coalesce(sum(le.amount) filter (where le.type = 'payment'), 0) as outstanding_balance,
  max(le.created_at) as last_activity_at
from public.customers c
left join public.ledger_entries le on le.customer_id = c.id
group by c.id, c.store_id;

-- ============================================================================
-- Dashboard aggregate function
-- ============================================================================
create or replace function public.get_dashboard_stats(p_store_id uuid)
returns table (
  total_products bigint,
  low_stock_products bigint,
  total_customers bigint,
  outstanding_credit numeric
)
language sql
security invoker
stable
as $$
  select
    (select count(*) from public.products where store_id = p_store_id) as total_products,
    (select count(*) from public.products where store_id = p_store_id and quantity <= low_stock_threshold) as low_stock_products,
    (select count(*) from public.customers where store_id = p_store_id) as total_customers,
    (select coalesce(sum(outstanding_balance), 0) from public.customer_balances where store_id = p_store_id) as outstanding_credit;
$$;

-- ============================================================================
-- Triggers
-- ============================================================================

-- updated_at maintenance for products
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_set_updated_at
  before update on public.products
  for each row
  execute function public.set_updated_at();

-- Auto-create a public.users row whenever a new auth.users row is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.users enable row level security;
alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.activities enable row level security;
alter table public.notification_settings enable row level security;

-- ---- users -------------------------------------------------------------
create policy "users_select_own"
  on public.users for select
  using (id = auth.uid());

create policy "users_update_own"
  on public.users for update
  using (id = auth.uid());

-- ---- stores --------------------------------------------------------------
-- Owners can fully manage their own store(s). (v1: one store per owner,
-- schema allows multiple for future multi-store support.)
create policy "stores_select_own"
  on public.stores for select
  using (owner_id = auth.uid());

create policy "stores_insert_own"
  on public.stores for insert
  with check (owner_id = auth.uid());

create policy "stores_update_own"
  on public.stores for update
  using (owner_id = auth.uid());

create policy "stores_delete_own"
  on public.stores for delete
  using (owner_id = auth.uid());

-- ---- helper: is this store_id owned by the current user? ------------------
create or replace function public.owns_store(p_store_id uuid)
returns boolean
language sql
security invoker
stable
as $$
  select exists (
    select 1 from public.stores
    where id = p_store_id and owner_id = auth.uid()
  );
$$;

-- ---- products --------------------------------------------------------------
create policy "products_select_own_store"
  on public.products for select
  using (public.owns_store(store_id));

create policy "products_insert_own_store"
  on public.products for insert
  with check (public.owns_store(store_id));

create policy "products_update_own_store"
  on public.products for update
  using (public.owns_store(store_id));

create policy "products_delete_own_store"
  on public.products for delete
  using (public.owns_store(store_id));

-- ---- customers --------------------------------------------------------------
create policy "customers_select_own_store"
  on public.customers for select
  using (public.owns_store(store_id));

create policy "customers_insert_own_store"
  on public.customers for insert
  with check (public.owns_store(store_id));

create policy "customers_update_own_store"
  on public.customers for update
  using (public.owns_store(store_id));

create policy "customers_delete_own_store"
  on public.customers for delete
  using (public.owns_store(store_id));

-- ---- ledger_entries -----------------------------------------------------
create policy "ledger_select_own_store"
  on public.ledger_entries for select
  using (public.owns_store(store_id));

create policy "ledger_insert_own_store"
  on public.ledger_entries for insert
  with check (public.owns_store(store_id));

create policy "ledger_update_own_store"
  on public.ledger_entries for update
  using (public.owns_store(store_id));

create policy "ledger_delete_own_store"
  on public.ledger_entries for delete
  using (public.owns_store(store_id));

-- ---- activities -----------------------------------------------------------
create policy "activities_select_own_store"
  on public.activities for select
  using (public.owns_store(store_id));

create policy "activities_insert_own_store"
  on public.activities for insert
  with check (public.owns_store(store_id));

-- ---- notification_settings --------------------------------------------------
create policy "notification_settings_select_own_store"
  on public.notification_settings for select
  using (public.owns_store(store_id));

create policy "notification_settings_insert_own_store"
  on public.notification_settings for insert
  with check (public.owns_store(store_id));

create policy "notification_settings_update_own_store"
  on public.notification_settings for update
  using (public.owns_store(store_id));

-- ============================================================================
-- Grants (views and functions execute with invoker's privileges + RLS)
-- ============================================================================
grant select on public.customer_balances to authenticated;
grant execute on function public.get_dashboard_stats(uuid) to authenticated;
grant execute on function public.owns_store(uuid) to authenticated;
