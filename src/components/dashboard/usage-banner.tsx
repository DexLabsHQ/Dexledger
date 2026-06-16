"use client";

import Link from "next/link";
import { AlertTriangle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { isAtLimit, isNearLimit, usagePercent } from "@/lib/subscription";

interface UsageBannerProps {
  /** "products" or "customers" */
  resource: "products" | "customers";
  used: number;
  limit: number;
}

export function UsageBanner({ resource, used, limit }: UsageBannerProps) {
  // Unlimited — don't render anything
  if (limit === -1) return null;

  const atLimit = isAtLimit(used, limit);
  const nearLimit = isNearLimit(used, limit);

  // Only render when near or at limit
  if (!nearLimit && !atLimit) return null;

  const percent = usagePercent(used, limit);
  const label = resource === "products" ? "Products" : "Customers";

  return (
    <div
      className={`rounded-xl border p-4 ${
        atLimit
          ? "border-destructive/30 bg-destructive/5"
          : "border-amber-500/30 bg-amber-500/5"
      }`}
    >
      <div className="flex items-start gap-3">
        {atLimit ? (
          <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
        ) : (
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-500" />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {atLimit
              ? `You've reached your Free plan limit`
              : `Approaching your Free plan limit`}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {used} / {limit} {label} Used
          </p>

          <Progress
            value={percent}
            className={`mt-2 h-1.5 ${atLimit ? "[&>div]:bg-destructive" : "[&>div]:bg-amber-500"}`}
          />

          {atLimit && (
            <p className="mt-2 text-xs text-muted-foreground">
              Upgrade to Premium for unlimited {label.toLowerCase()}.
            </p>
          )}
        </div>

        <Button size="sm" variant="outline" asChild className="shrink-0">
          <Link href="/upgrade">Upgrade</Link>
        </Button>
      </div>
    </div>
  );
}
