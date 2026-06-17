"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import {
  createRazorpaySubscription,
  cancelRazorpaySubscription,
  verifyRazorpaySignature,
} from "@/lib/razorpay/client";
import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/actions/auth";

// ── Create subscription ───────────────────────────────────────────────────────

export interface CreateSubscriptionResult {
  subscriptionId?: string;
  keyId?: string;
  error?: string;
}

/**
 * Creates a Razorpay subscription and returns the subscription ID + public key
 * for the client-side Razorpay Checkout to open.
 * Does NOT activate the plan — that happens via webhook after payment.
 */
export async function createSubscription(): Promise<CreateSubscriptionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated." };

  const store = await getCurrentStore();
  if (!store) return { error: "No store found." };

  // Idempotency: if already on premium/business, don't create another
  if (store.plan === "premium" || store.plan === "business") {
    return { error: "Already on a paid plan." };
  }

  // Check if there's an existing active Razorpay subscription
  const { data: existing } = await supabase
    .from("razorpay_subscriptions")
    .select("razorpay_subscription_id, status")
    .eq("store_id", store.id)
    .maybeSingle();

  // Reuse if already created but not yet paid (created/authenticated status)
  if (existing && ["created", "authenticated"].includes(existing.status)) {
    return {
      subscriptionId: existing.razorpay_subscription_id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    };
  }

  // Fetch user profile for prefilling Razorpay checkout
  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .maybeSingle();

  try {
    const subscription = await createRazorpaySubscription({
      storeId: store.id,
      customerEmail: profile?.email ?? user.email ?? undefined,
    });

    // Persist the subscription row immediately (status = created)
    await supabase.from("razorpay_subscriptions").upsert(
      {
        store_id: store.id,
        razorpay_subscription_id: subscription.id,
        razorpay_plan_id: subscription.plan_id,
        status: subscription.status,
        total_count: subscription.total_count,
        short_url: subscription.short_url,
      },
      { onConflict: "store_id" }
    );

    return {
      subscriptionId: subscription.id,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create subscription.";
    return { error: message };
  }
}

// ── Verify payment after checkout ─────────────────────────────────────────────

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

/**
 * Called client-side after Razorpay Checkout succeeds.
 * Verifies the signature server-side. The actual plan activation
 * happens via webhook, but we optimistically update the UI here.
 */
export async function verifySubscriptionPayment(
  payload: VerifyPaymentPayload
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getCurrentStore();
  if (!store) return { error: "No store found." };

  // Verify signature server-side — never trust client data
  const isValid = verifyRazorpaySignature({
    subscriptionId: payload.razorpay_subscription_id,
    paymentId: payload.razorpay_payment_id,
    signature: payload.razorpay_signature,
  });

  if (!isValid) {
    return { error: "Payment verification failed. Please contact support." };
  }

  // Record the payment event
  await supabase.from("subscription_events").insert({
    store_id: store.id,
    plan: "premium",
    source: "razorpay",
    razorpay_subscription_id: payload.razorpay_subscription_id,
    razorpay_payment_id: payload.razorpay_payment_id,
    event_type: "payment.authorized",
    status: "authorized",
  });

  // Optimistic plan upgrade — webhook will confirm
  await supabase
    .from("stores")
    .update({ plan: "premium" })
    .eq("id", store.id);

  // Update subscription row status
const { data, error } = await supabase
  .from("razorpay_subscriptions")
  .update({
    status: "authenticated",
    razorpay_plan_id: payload.razorpay_subscription_id,
  })
  .eq("store_id", store.id);

console.log("subscription update", data, error);

  revalidatePath("/billing");
  revalidatePath("/upgrade");
  revalidatePath("/dashboard");

  return {};
}

// ── Cancel subscription ───────────────────────────────────────────────────────

/**
 * Cancels the active subscription at end of current billing period.
 * User retains premium access until current_end.
 */
export async function cancelSubscription(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const store = await getCurrentStore();
  if (!store) return { error: "No store found." };

  if (store.plan === "free") {
    return { error: "No active subscription to cancel." };
  }

  // Get the Razorpay subscription ID
  const { data: rzpSub } = await supabase
    .from("razorpay_subscriptions")
    .select("razorpay_subscription_id, status")
    .eq("store_id", store.id)
    .maybeSingle();

  if (!rzpSub?.razorpay_subscription_id) {
    return { error: "No Razorpay subscription found." };
  }

  if (rzpSub.status === "cancelled") {
    return { error: "Subscription is already cancelled." };
  }

  try {
    // Cancel at end of billing cycle (user keeps access until period end)
    await cancelRazorpaySubscription(rzpSub.razorpay_subscription_id, true);

    // Update local status — webhook will confirm
    await supabase
      .from("razorpay_subscriptions")
      .update({ status: "cancelled" })
      .eq("store_id", store.id);

    await supabase.from("subscription_events").insert({
      store_id: store.id,
      plan: store.plan as "premium" | "business" | "free",
      source: "razorpay",
      razorpay_subscription_id: rzpSub.razorpay_subscription_id,
      event_type: "subscription.cancelled",
      status: "cancelled",
    });

    revalidatePath("/billing");
    revalidatePath("/dashboard");

    return {};
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cancel subscription.";
    return { error: message };
  }
}
