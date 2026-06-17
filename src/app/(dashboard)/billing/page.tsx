import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { RazorpayCheckoutButton } from "@/components/dashboard/razorpay-checkout-button";
import { CancelSubscriptionButton } from "@/components/dashboard/cancel-subscription-button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import type { SubscriptionPlan } from "@/lib/types/database";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatCurrency(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    active:        { label: "Active",        className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    authenticated: { label: "Pending",       className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    created:       { label: "Created",       className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    cancelled:     { label: "Cancelled",     className: "bg-red-500/10 text-red-600 border-red-500/20" },
    halted:        { label: "Payment Failed",className: "bg-red-500/10 text-red-600 border-red-500/20" },
    pending:       { label: "Pending",       className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    expired:       { label: "Expired",       className: "bg-muted text-muted-foreground" },
    completed:     { label: "Completed",     className: "bg-muted text-muted-foreground" },
  };

  const { label, className } = map[status] ?? { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>;
}) {
  const params = await searchParams;
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const plan = (store.plan ?? "free") as SubscriptionPlan;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user!.id)
    .maybeSingle();

  // Active Razorpay subscription row
  const { data: rzpSub } = await supabase
    .from("razorpay_subscriptions")
    .select("*")
    .eq("store_id", store.id)
    .maybeSingle();

  // Payment history from subscription_events
  const { data: events } = await supabase
    .from("subscription_events")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const isPro = plan === "premium" || plan === "business";
  const isHalted = rzpSub?.status === "halted";
  const isCancelled = rzpSub?.status === "cancelled";

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment history."
      />

      {/* Upgrade success banner */}
      {params.upgraded === "true" && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-700">Welcome to Pro!</p>
            <p className="text-xs text-emerald-600">Your account has been upgraded. All features are now unlocked.</p>
          </div>
        </div>
      )}

      {/* Halted payment warning */}
      {isHalted && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4">
          <AlertTriangle className="size-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-semibold text-destructive">Payment Failed</p>
            <p className="text-xs text-muted-foreground">
              We couldn&apos;t collect your last payment. Please update your payment method via Razorpay.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current Plan
            </p>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-2xl font-bold capitalize">{plan}</p>
              {isPro && <Sparkles className="size-5 text-amber-500" />}
            </div>
          </div>
          {rzpSub && <StatusBadge status={rzpSub.status} />}
        </div>

        {/* Plan details */}
        {isPro ? (
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />Unlimited Products & Customers</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />Credit / Udhaar</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />CSV & Excel Exports</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />WhatsApp Reports</li>
          </ul>
        ) : (
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />50 Products</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-500" />25 Customers</li>
            <li className="flex items-center gap-2"><XCircle className="size-4 text-muted-foreground/40" />Credit / Udhaar</li>
            <li className="flex items-center gap-2"><XCircle className="size-4 text-muted-foreground/40" />Exports & Reports</li>
          </ul>
        )}

        {/* Billing dates */}
        {rzpSub && (rzpSub.current_end || rzpSub.charge_at) && (
          <div className="mt-5 flex gap-6 rounded-lg border border-border bg-secondary/30 p-4 text-sm">
            {rzpSub.current_end && (
              <div>
                <p className="text-xs text-muted-foreground">
                  {isCancelled ? "Access until" : "Current period ends"}
                </p>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {formatDate(rzpSub.current_end)}
                </p>
              </div>
            )}
            {rzpSub.charge_at && !isCancelled && (
              <div>
                <p className="text-xs text-muted-foreground">Next renewal</p>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <CreditCard className="size-3.5 text-muted-foreground" />
                  {formatDate(rzpSub.charge_at)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!isPro && (
            <RazorpayCheckoutButton
              userEmail={profile?.email ?? user!.email ?? undefined}
              userName={profile?.name ?? undefined}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Upgrade to Pro — ₹299/mo
            </RazorpayCheckoutButton>
          )}

          {isPro && !isCancelled && (
            <CancelSubscriptionButton />
          )}

          {isCancelled && (
            <p className="text-sm text-muted-foreground">
              Subscription cancelled. Pro access until {formatDate(rzpSub?.current_end ?? null)}.
            </p>
          )}
        </div>
      </div>

      {/* Payment History */}
      {events && events.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">Payment History</h2>
          </div>
          <div className="divide-y divide-border">
            {events.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {(e.event_type ?? e.source ?? "event").replace(/\./g, " → ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  {e.status && <StatusBadge status={e.status} />}
                  {e.razorpay_payment_id && (
                    <p className="mt-1 text-xs text-muted-foreground font-mono">
                      {e.razorpay_payment_id}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
