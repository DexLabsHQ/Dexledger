import Link from "next/link";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { usagePercent } from "@/lib/subscription";
import { PLAN_LIMITS, type SubscriptionPlan } from "@/lib/types/database";

interface PlanCardProps {
  plan: SubscriptionPlan;
  productCount: number;
  customerCount: number;
}

export function PlanCard({ plan, productCount, customerCount }: PlanCardProps) {
  const limits = PLAN_LIMITS[plan];
  const isPremiumOrAbove = plan === "premium" || plan === "business";

  const productPercent =
    limits.max_products === -1 ? 0 : usagePercent(productCount, limits.max_products);
  const customerPercent =
    limits.max_customers === -1 ? 0 : usagePercent(customerCount, limits.max_customers);

  const planLabel = plan.charAt(0).toUpperCase() + plan.slice(1);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Current Plan
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xl font-bold">{planLabel}</p>
            {isPremiumOrAbove && (
              <CheckCircle2 className="size-5 text-emerald-500" />
            )}
          </div>
        </div>
        {!isPremiumOrAbove && (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600">
            Free
          </span>
        )}
      </div>

      {/* Usage bars — only shown on free plan */}
      {!isPremiumOrAbove && (
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Products</span>
              <span>
                {productCount} / {limits.max_products}
              </span>
            </div>
            <Progress
              value={productPercent}
              className={`h-1.5 ${productPercent >= 100 ? "[&>div]:bg-destructive" : productPercent >= 80 ? "[&>div]:bg-amber-500" : ""}`}
            />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Customers</span>
              <span>
                {customerCount} / {limits.max_customers}
              </span>
            </div>
            <Progress
              value={customerPercent}
              className={`h-1.5 ${customerPercent >= 100 ? "[&>div]:bg-destructive" : customerPercent >= 80 ? "[&>div]:bg-amber-500" : ""}`}
            />
          </div>
        </div>
      )}

      {/* Premium / Business perks */}
      {isPremiumOrAbove && (
        <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Unlimited Inventory
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            Unlimited Customers
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-emerald-500" />
            WhatsApp Reports Enabled
          </li>
        </ul>
      )}

      {/* Upgrade CTA */}
      {!isPremiumOrAbove && (
        <Button asChild size="sm" className="mt-4 w-full gap-1.5" variant="accent">
          <Link href="/upgrade">
            <Sparkles className="size-3.5" />
            Upgrade to Premium
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}
