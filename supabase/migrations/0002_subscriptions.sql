-- ============================================================================
-- DexLedger: Subscription / Plan architecture
-- Migration 0002 — adds plan column to stores + subscriptions audit table.
--
-- Plans: free | premium | business
-- Future: Razorpay webhook will UPDATE stores.plan and insert a
--         subscription_events row. No payment logic here yet.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enum
-- ----------------------------------------------------------------------------
create type subscription_plan as enum ('free', 'premium', 'business');

-- ----------------------------------------------------------------------------
-- Add plan column to stores (every store defaults to free)
-- ----------------------------------------------------------------------------
alter table public.stores
  add column plan subscription_plan not null default 'free';

-- ----------------------------------------------------------------------------
-- subscription_events
-- Append-only audit log for plan changes (Razorpay webhook will insert here).
-- ----------------------------------------------------------------------------
create table public.subscription_events (
  id             uuid primary key default gen_random_uuid(),
  store_id       uuid not null references public.stores(id) on delete cascade,
  plan           subscription_plan not null,
  source         text not null default 'manual',   -- 'manual' | 'razorpay' | 'admin'
  razorpay_order_id   text,
  razorpay_payment_id text,
  created_at     timestamptz not null default now()
);

create index subscription_events_store_id_idx
  on public.subscription_events (store_id, created_at desc);

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.subscription_events enable row level security;

create policy "sub_events_select_own_store"
  on public.subscription_events for select
  using (public.owns_store(store_id));

-- Only backend/service-role inserts subscription_events (via webhook).
-- Application layer must NOT insert directly; policy intentionally omitted.

-- ----------------------------------------------------------------------------
-- Grant
-- ----------------------------------------------------------------------------
grant select on public.subscription_events to authenticated;

-- ============================================================================
-- Plan limits helper function
-- Returns the feature limits for a given plan as a JSON object.
-- Used by application layer to enforce gating without hardcoding limits.
-- ============================================================================
create or replace function public.get_plan_limits(p_plan subscription_plan)
returns jsonb
language sql
immutable
as $$
  select case p_plan
    when 'free' then jsonb_build_object(
      'max_products',   50,
      'max_customers',  25,
      'credit',         false,
      'customer_ledger',false,
      'csv_export',     false,
      'excel_export',   false,
      'whatsapp',       false,
      'weekly_reports', false,
      'daily_reports',  false,
      'employee_accounts', false,
      'multi_store_staff', false
    )
    when 'premium' then jsonb_build_object(
      'max_products',   -1,   -- -1 = unlimited
      'max_customers',  -1,
      'credit',         true,
      'customer_ledger',true,
      'csv_export',     true,
      'excel_export',   true,
      'whatsapp',       true,
      'weekly_reports', true,
      'daily_reports',  true,
      'employee_accounts', false,
      'multi_store_staff', false
    )
    when 'business' then jsonb_build_object(
      'max_products',   -1,
      'max_customers',  -1,
      'credit',         true,
      'customer_ledger',true,
      'csv_export',     true,
      'excel_export',   true,
      'whatsapp',       true,
      'weekly_reports', true,
      'daily_reports',  true,
      'employee_accounts', true,
      'multi_store_staff', true
    )
  end;
$$;

grant execute on function public.get_plan_limits(subscription_plan) to authenticated;
