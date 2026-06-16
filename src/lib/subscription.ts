/**
 * lib/subscription.ts
 * Centralised helpers for plan feature-gating.
 * Import these in both server components and client components.
 */

import { PLAN_LIMITS, type PlanLimits, type SubscriptionPlan } from "@/lib/types/database";

/** Returns the feature limits object for a given plan. */
export function getPlanLimits(plan: SubscriptionPlan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/** Returns true if the feature is available on the given plan. */
export function hasFeature(plan: SubscriptionPlan, feature: keyof PlanLimits): boolean {
  const limits = getPlanLimits(plan);
  const val = limits[feature];
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val === -1 || val > 0; // -1 = unlimited
  return false;
}

/** Returns true if the store is at or above a target plan tier. */
export function atLeastPlan(current: SubscriptionPlan, required: SubscriptionPlan): boolean {
  const order: SubscriptionPlan[] = ["free", "premium", "business"];
  return order.indexOf(current) >= order.indexOf(required);
}

/** Returns usage percentage (0-100) for a resource vs plan limit. */
export function usagePercent(used: number, limit: number): number {
  if (limit === -1) return 0; // unlimited
  if (limit === 0) return 100;
  return Math.min(100, Math.round((used / limit) * 100));
}

/** Returns true if used >= limit (hard block). */
export function isAtLimit(used: number, limit: number): boolean {
  if (limit === -1) return false;
  return used >= limit;
}

/** Returns true if close to limit (within 5 units or ≥80%). */
export function isNearLimit(used: number, limit: number): boolean {
  if (limit === -1) return false;
  return used >= limit - 5 || usagePercent(used, limit) >= 80;
}
