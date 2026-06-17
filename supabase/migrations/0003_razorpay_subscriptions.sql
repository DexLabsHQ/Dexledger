-- ============================================================================
-- DexLedger: Razorpay recurring subscription tracking
-- Migration 0003
--
-- Extends subscription_events (from 0002) with Razorpay-specific fields.
-- Adds a razorpay_subscriptions table for active subscription state.
-- Webhook idempotency is handled via razorpay_event_id uniqueness.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- razorpay_subscriptions
-- One active row per store (upserted by webhook). Tracks the live Razorpay
-- subscription object so we can cancel, check status, and show renewal date.
-- ----------------------------------------------------------------------------
create table public.razorpay_subscriptions (
  id                        uuid primary key default gen_random_uuid(),
  store_id                  uuid not null unique references public.stores(id) on delete cascade,
  razorpay_subscription_id  text not null unique,
  razorpay_plan_id          text not null,
  status                    text not null default 'created',
  -- Razorpay subscription statuses:
  -- created | authenticated | active | pending | halted | cancelled | completed | expired
  current_start             timestamptz,
  current_end               timestamptz,
  charge_at                 timestamptz,
  total_count               integer,
  paid_count                integer default 0,
  remaining_count           integer,
  short_url                 text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index razorpay_subscriptions_store_id_idx
  on public.razorpay_subscriptions (store_id);

create index razorpay_subscriptions_razorpay_id_idx
  on public.razorpay_subscriptions (razorpay_subscription_id);

-- updated_at trigger
create trigger razorpay_subscriptions_set_updated_at
  before update on public.razorpay_subscriptions
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Extend subscription_events for webhook idempotency
-- razorpay_event_id: unique Razorpay webhook event ID (prevents duplicate processing)
-- ----------------------------------------------------------------------------
alter table public.subscription_events
  add column if not exists razorpay_subscription_id text,
  add column if not exists razorpay_event_id         text unique,  -- idempotency key
  add column if not exists status                    text,         -- event-level status snapshot
  add column if not exists event_type                text;         -- e.g. 'subscription.charged'

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
alter table public.razorpay_subscriptions enable row level security;

create policy "rzp_sub_select_own_store"
  on public.razorpay_subscriptions for select
  using (public.owns_store(store_id));

-- Only service-role (webhook handler) writes to this table.
-- App layer reads only.

-- ----------------------------------------------------------------------------
-- Grants
-- ----------------------------------------------------------------------------
grant select on public.razorpay_subscriptions to authenticated;
