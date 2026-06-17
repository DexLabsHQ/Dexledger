import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, XCircle, Sparkles, Zap } from "lucide-react";
import { getCurrentStore } from "@/lib/actions/store";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { RazorpayCheckoutButton } from "@/components/dashboard/razorpay-checkout-button";
import type { SubscriptionPlan } from "@/lib/types/database";

interface PlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

const FEATURES: PlanFeature[] = [
  { label: "Products",              free: "50 max",    pro: "Unlimited" },
  { label: "Customers",             free: "25 max",    pro: "Unlimited" },
  { label: "Inventory Management",  free: true,        pro: true },
  { label: "Customer Management",   free: true,        pro: true },
  { label: "Low Stock Alerts",      free: true,        pro: true },
  { label: "Credit / Udhaar",       free: false,       pro: true },
  { label: "Customer Ledger",       free: false,       pro: true },
  { label: "CSV Export",            free: false,       pro: true },
  { label: "Excel Export",          free: false,       pro: true },
  { label: "WhatsApp Reports",      free: false,       pro: true },
  { label: "Weekly Reports",        free: false,       pro: true },
  { label: "Daily Reports",         free: false,       pro: true },
  { label: "Priority Support",      free: false,       pro: true },
  { label: "All Future Features",   free: false,       pro: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true)  return <CheckCircle2 className="mx-auto size-4 text-emerald-500" />;
  if (value === false) return <XCircle className="mx-auto size-4 text-muted-foreground/40" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export default async function UpgradePage() {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const plan = (store.plan ?? "free") as SubscriptionPlan;
  const isPro = plan === "premium" || plan === "business";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user!.id)
    .maybeSingle();

  return (
    <div>
      <PageHeader
        title="Upgrade Your Plan"
        description="Unlock unlimited everything for ₹299/month."
      />

      <div className="mt-2 grid gap-4 sm:grid-cols-2 max-w-2xl">
        {/* FREE */}
        <div
          className={`rounded-xl border bg-card p-6 ${
            !isPro ? "border-primary ring-2 ring-primary/20" : "border-border"
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-muted-foreground" />
            <h2 className="font-bold text-lg">Free</h2>
            {!isPro && (
              <span className="ml-auto text-xs font-medium text-primary">Current</span>
            )}
          </div>
          <p className="mt-1 text-3xl font-extrabold">₹0</p>
          <p className="text-xs text-muted-foreground">Forever free</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />50 Products</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />25 Customers</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Inventory & Dashboard</li>
          </ul>
          <Button className="mt-6 w-full" variant="outline" disabled>
            {!isPro ? "Current Plan" : "Free Plan"}
          </Button>
        </div>

        {/* PRO */}
        <div
          className={`rounded-xl border bg-card p-6 relative ${
            isPro
              ? "border-amber-500 ring-2 ring-amber-500/20"
              : "border-amber-500/40"
          }`}
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
              {isPro ? "Your Plan" : "Most Popular"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="font-bold text-lg">Pro</h2>
            {isPro && (
              <span className="ml-auto text-xs font-medium text-amber-600">Active</span>
            )}
          </div>
          <p className="mt-1 text-3xl font-extrabold">
            ₹299
            <span className="text-base font-normal text-muted-foreground">/mo</span>
          </p>
          <p className="text-xs text-muted-foreground">Billed monthly · Cancel anytime</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Unlimited Products & Customers</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Credit / Udhaar Tracking</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />CSV & Excel Exports</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />WhatsApp Reports</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />All Future Features</li>
          </ul>

          <div className="mt-6">
            {isPro ? (
              <Button className="w-full" variant="outline" asChild>
                <Link href="/billing">Manage Subscription</Link>
              </Button>
            ) : (
              <RazorpayCheckoutButton
                userEmail={profile?.email ?? user?.email ?? undefined}
                userName={profile?.name ?? undefined}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                Upgrade to Pro — ₹299/mo
              </RazorpayCheckoutButton>
            )}
          </div>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-card max-w-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left font-semibold">Feature</th>
              <th className="px-4 py-4 text-center font-semibold text-muted-foreground">Free</th>
              <th className="px-4 py-4 text-center font-semibold text-amber-600">Pro</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f, i) => (
              <tr
                key={f.label}
                className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}
              >
                <td className="px-6 py-3 text-muted-foreground">{f.label}</td>
                <td className="px-4 py-3 text-center"><Cell value={f.free} /></td>
                <td className="px-4 py-3 text-center"><Cell value={f.pro} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground max-w-2xl">
        Secured by Razorpay · Cancel anytime · No hidden fees
      </p>
    </div>
  );
}
