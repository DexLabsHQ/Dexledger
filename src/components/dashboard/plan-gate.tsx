import Link from "next/link";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SubscriptionPlan } from "@/lib/types/database";

interface PlanGateProps {
  /** Feature display name, e.g. "Credit & Udhaar" */
  featureName: string;
  /** Short description shown under the feature name */
  description?: string;
  /** Required plan to unlock. Defaults to "premium". */
  requiredPlan?: SubscriptionPlan;
  /** Bullet list of benefits unlocked with this feature */
  benefits?: string[];
}

const PLAN_COLORS: Record<string, string> = {
  premium: "text-amber-500",
  business: "text-violet-500",
};

const PLAN_BADGE: Record<string, string> = {
  premium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  business: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

export function PlanGate({
  featureName,
  description,
  requiredPlan = "premium",
  benefits = [],
}: PlanGateProps) {
  const colorClass = PLAN_COLORS[requiredPlan] ?? "text-amber-500";
  const badgeClass = PLAN_BADGE[requiredPlan] ?? PLAN_BADGE.premium;
  const planLabel = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="mx-auto max-w-md text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-secondary">
          <Lock className={`size-7 ${colorClass}`} />
        </div>

        {/* Plan badge */}
        <span
          className={`mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
        >
          <Sparkles className="size-3" />
          {planLabel} Feature
        </span>

        {/* Heading */}
        <h1 className="mt-3 text-2xl font-bold tracking-tight">
          {featureName} is available on {planLabel}
        </h1>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground">
          {description ??
            `Upgrade to ${planLabel} to unlock ${featureName} and take your business to the next level.`}
        </p>

        {/* Benefits */}
        {benefits.length > 0 && (
          <ul className="mt-6 space-y-2 text-left">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <span className={`size-4 shrink-0 ${colorClass}`}>✓</span>
                {b}
              </li>
            ))}
          </ul>
        )}

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/upgrade">
              Upgrade to {planLabel}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
