/**
 * lib/razorpay/client.ts
 * Server-only Razorpay SDK wrapper. Never import this in client components.
 *
 * Uses the Razorpay REST API directly (no SDK dependency needed).
 * All requests are authenticated with key_id:key_secret Basic Auth.
 */

import crypto from "node:crypto";
const RAZORPAY_BASE = "https://api.razorpay.com/v1";

function getAuthHeader(): string {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set.");
  }

  return "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
}

async function razorpayFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${RAZORPAY_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data?.error?.description ?? data?.error?.reason ?? "Razorpay API error";
    throw new Error(msg);
  }

  return data as T;
}

// ── Subscription types ────────────────────────────────────────────────────────

export interface RazorpaySubscription {
  id: string;
  entity: "subscription";
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  charge_at: number | null;
  total_count: number;
  paid_count: number;
  remaining_count: number;
  short_url: string;
  created_at: number;
}

export interface RazorpayPlan {
  id: string;
  entity: "plan";
  interval: number;
  period: string;
  item: {
    id: string;
    name: string;
    amount: number;
    unit_amount: number;
    currency: string;
  };
}

// ── API methods ───────────────────────────────────────────────────────────────

/**
 * Creates a Razorpay subscription for the Pro plan.
 * total_count: 12 = 12 monthly billing cycles (1 year), set higher for longer.
 */
export async function createRazorpaySubscription(params: {
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  storeId: string;
}): Promise<RazorpaySubscription> {
  const planId = process.env.RAZORPAY_PLAN_ID;
  if (!planId) throw new Error("RAZORPAY_PLAN_ID env variable not set.");

  return razorpayFetch<RazorpaySubscription>("/subscriptions", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      total_count: 120,           // 120 months = ~10 years (effectively unlimited)
      quantity: 1,
      customer_notify: 1,
      notes: {
        store_id: params.storeId,
      },
      ...(params.customerEmail || params.customerPhone
        ? {
            notify_info: {
              notify_email: params.customerEmail,
              notify_phone: params.customerPhone,
            },
          }
        : {}),
    }),
  });
}

/** Fetches an existing Razorpay subscription by ID. */
export async function getRazorpaySubscription(
  subscriptionId: string
): Promise<RazorpaySubscription> {
  return razorpayFetch<RazorpaySubscription>(`/subscriptions/${subscriptionId}`);
}

/** Cancels a Razorpay subscription at end of current billing cycle. */
export async function cancelRazorpaySubscription(
  subscriptionId: string,
  cancelAtCycleEnd = true
): Promise<RazorpaySubscription> {
  return razorpayFetch<RazorpaySubscription>(
    `/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      body: JSON.stringify({
        cancel_at_cycle_end: cancelAtCycleEnd ? 1 : 0,
      }),
    }
  );
}

/** Verifies a Razorpay payment signature. Returns true if valid. */
export function verifyRazorpaySignature(params: {
  subscriptionId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET!;

  const body = `${params.paymentId}|${params.subscriptionId}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  return expectedSignature === params.signature;
}

/** Verifies a Razorpay webhook signature. Returns true if valid. */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return expectedSignature === signature;
}
