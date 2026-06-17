/**
 * app/api/webhooks/razorpay/route.ts
 *
 * Handles all Razorpay webhook events.
 * - Verifies HMAC-SHA256 signature
 * - Prevents duplicate processing via razorpay_event_id uniqueness
 * - Updates stores.plan and razorpay_subscriptions accordingly
 *
 * Configure in Razorpay Dashboard → Webhooks:
 *   URL: https://yourdomain.com/api/webhooks/razorpay
 *   Events: subscription.*, payment.authorized, payment.failed
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyWebhookSignature } from "@/lib/razorpay/client";
import type { Database } from "@/lib/types/supabase";

// Use service-role client for webhook — bypasses RLS intentionally.
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !serviceKey) {
    throw new Error("Supabase service role key not configured.");
  }

  return createClient<Database>(url, serviceKey);
}

export async function POST(req: NextRequest) {
  let rawBody: string;

  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  // ── 1. Verify webhook signature ──────────────────────────────────────────
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[webhook] Invalid Razorpay signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: RazorpayWebhookEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getServiceClient();
  const eventId = event.id;
  const eventType = event.event;

  console.log(`[webhook] Received: ${eventType} (${eventId})`);

  // ── 2. Idempotency — skip already-processed events ───────────────────────
  if (eventId) {
    const { data: existing } = await supabase
      .from("subscription_events")
      .select("id")
      .eq("razorpay_event_id", eventId)
      .maybeSingle();

    if (existing) {
      console.log(`[webhook] Duplicate event ${eventId}, skipping.`);
      return NextResponse.json({ status: "duplicate" }, { status: 200 });
    }
  }

  // ── 3. Extract subscription and store ────────────────────────────────────
  const subscription = event.payload?.subscription?.entity;
  const payment = event.payload?.payment?.entity;

  const razorpaySubscriptionId =
    subscription?.id ??
    payment?.subscription_id ??
    null;

  // Look up store_id from razorpay_subscriptions table
  let storeId: string | null = null;

  if (razorpaySubscriptionId) {
    const { data: rzpSub } = await supabase
      .from("razorpay_subscriptions")
      .select("store_id")
      .eq("razorpay_subscription_id", razorpaySubscriptionId)
      .maybeSingle();

    storeId = rzpSub?.store_id ?? null;
  }

  // Fallback: read store_id from subscription notes
  if (!storeId && subscription?.notes?.store_id) {
    storeId = subscription.notes.store_id as string;
  }

  if (!storeId) {
    console.error(`[webhook] Cannot resolve store_id for event ${eventId}`);
    // Return 200 to prevent Razorpay retrying — we can't process without store
    return NextResponse.json({ status: "unresolvable" }, { status: 200 });
  }

  // ── 4. Process event ──────────────────────────────────────────────────────
  try {
    switch (eventType) {
      case "subscription.activated":
      case "subscription.charged": {
        // Plan is now active / payment collected
        await supabase
          .from("stores")
          .update({ plan: "premium" })
          .eq("id", storeId);

        await supabase
          .from("razorpay_subscriptions")
          .upsert(
            {
              store_id: storeId,
              razorpay_subscription_id: subscription!.id,
              razorpay_plan_id: subscription!.plan_id,
              status: subscription!.status,
              current_start: subscription!.current_start
                ? new Date(subscription!.current_start * 1000).toISOString()
                : null,
              current_end: subscription!.current_end
                ? new Date(subscription!.current_end * 1000).toISOString()
                : null,
              charge_at: subscription!.charge_at
                ? new Date(subscription!.charge_at * 1000).toISOString()
                : null,
              total_count: subscription!.total_count,
              paid_count: subscription!.paid_count,
              remaining_count: subscription!.remaining_count,
              short_url: subscription!.short_url,
            },
            { onConflict: "store_id" }
          );

        break;
      }

      case "subscription.cancelled":
      case "subscription.completed":
      case "subscription.expired": {
        // Subscription ended — downgrade to free
        await supabase
          .from("stores")
          .update({ plan: "free" })
          .eq("id", storeId);

        await supabase
          .from("razorpay_subscriptions")
          .update({ status: subscription?.status ?? eventType.split(".")[1] })
          .eq("store_id", storeId);

        break;
      }

      case "subscription.halted": {
        // Payment failed too many times — keep current plan but mark halted
        await supabase
          .from("razorpay_subscriptions")
          .update({ status: "halted" })
          .eq("store_id", storeId);

        break;
      }

      case "subscription.pending": {
        await supabase
          .from("razorpay_subscriptions")
          .update({ status: "pending" })
          .eq("store_id", storeId);

        break;
      }

      case "payment.authorized": {
        // Payment authorized — recorded for audit
        break;
      }

      case "payment.failed": {
        // Don't downgrade immediately — Razorpay retries.
        // halted event will fire if all retries fail.
        console.warn(`[webhook] Payment failed for store ${storeId}`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event type: ${eventType}`);
    }

    // ── 5. Record event for audit trail ──────────────────────────────────────
    await supabase.from("subscription_events").insert({
      store_id: storeId,
      plan: "premium",
      source: "razorpay",
      razorpay_subscription_id: razorpaySubscriptionId,
      razorpay_payment_id: payment?.id ?? null,
      razorpay_event_id: eventId,
      event_type: eventType,
      status: subscription?.status ?? payment?.status ?? null,
    });

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (err) {
    console.error(`[webhook] Error processing ${eventType}:`, err);
    // Return 500 so Razorpay retries
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// ── Razorpay webhook event types ──────────────────────────────────────────────

interface RazorpayWebhookEvent {
  id: string;
  entity: string;
  event: string;
  payload: {
    subscription?: {
      entity: {
        id: string;
        plan_id: string;
        status: string;
        current_start: number | null;
        current_end: number | null;
        charge_at: number | null;
        total_count: number;
        paid_count: number;
        remaining_count: number;
        short_url: string;
        notes?: Record<string, unknown>;
      };
    };
    payment?: {
      entity: {
        id: string;
        subscription_id?: string;
        status: string;
        amount: number;
        currency: string;
      };
    };
  };
  created_at: number;
}
