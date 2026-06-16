import Link from "next/link";
import { CheckCircle2, XCircle, Sparkles, Building2, Zap } from "lucide-react";
import { getCurrentStore } from "@/lib/actions/store";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import type { SubscriptionPlan } from "@/lib/types/database";

interface PlanFeature {
  label: string;
  free: boolean | string;
  premium: boolean | string;
  business: boolean | string;
}

const FEATURES: PlanFeature[] = [
  { label: "Products",           free: "50 max",      premium: "Unlimited", business: "Unlimited" },
  { label: "Customers",          free: "25 max",      premium: "Unlimited", business: "Unlimited" },
  { label: "Inventory Management", free: true,        premium: true,        business: true },
  { label: "Customer Management",  free: true,        premium: true,        business: true },
  { label: "Low Stock Alerts",     free: true,        premium: true,        business: true },
  { label: "Credit / Udhaar",      free: false,       premium: true,        business: true },
  { label: "Customer Ledger",      free: false,       premium: true,        business: true },
  { label: "CSV Export",           free: false,       premium: true,        business: true },
  { label: "Excel Export",         free: false,       premium: true,        business: true },
  { label: "WhatsApp Reports",     free: false,       premium: true,        business: true },
  { label: "Weekly Reports",       free: false,       premium: true,        business: true },
  { label: "Daily Reports",        free: false,       premium: true,        business: true },
  { label: "Employee Accounts",    free: false,       premium: false,       business: "Coming soon" },
  { label: "Multi-store Staff",    free: false,       premium: false,       business: "Coming soon" },
  { label: "Priority Support",     free: false,       premium: false,       business: "Coming soon" },
];

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <CheckCircle2 className="mx-auto size-4 text-emerald-500" />;
  if (value === false) return <XCircle className="mx-auto size-4 text-muted-foreground/40" />;
  return <span className="text-xs text-muted-foreground">{value}</span>;
}

export default async function UpgradePage() {
  const store = await getCurrentStore();
  const plan = ((store?.plan) ?? "free") as SubscriptionPlan;

  return (
    <div>
      <PageHeader
        title="Upgrade Your Plan"
        description="Choose the plan that fits your business."
      />

      {/* Plan cards */}
      <div className="mt-2 grid gap-4 sm:grid-cols-3">
        {/* FREE */}
        <div className={`rounded-xl border bg-card p-6 ${plan === "free" ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-muted-foreground" />
            <h2 className="font-bold text-lg">Free</h2>
            {plan === "free" && (
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
          <Button className="mt-6 w-full" variant="outline" disabled={plan === "free"} asChild={plan !== "free"}>
            {plan === "free" ? <span>Current Plan</span> : <Link href="#">Downgrade</Link>}
          </Button>
        </div>

        {/* PREMIUM */}
        <div className={`rounded-xl border bg-card p-6 relative ${plan === "premium" ? "border-amber-500 ring-2 ring-amber-500/20" : "border-amber-500/40"}`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-white">
              Most Popular
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-amber-500" />
            <h2 className="font-bold text-lg">Premium</h2>
            {plan === "premium" && (
              <span className="ml-auto text-xs font-medium text-amber-600">Current</span>
            )}
          </div>
          <p className="mt-1 text-3xl font-extrabold">₹299<span className="text-base font-normal text-muted-foreground">/mo</span></p>
          <p className="text-xs text-muted-foreground">Billed monthly</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Unlimited Products & Customers</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Credit / Udhaar</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />CSV & Excel Exports</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />WhatsApp Reports</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Daily & Weekly Digests</li>
          </ul>
          <Button
            className="mt-6 w-full bg-amber-500 hover:bg-amber-600 text-white"
            disabled={plan === "premium"}
            asChild={plan !== "premium"}
          >
            {/* TODO: wire to Razorpay — replace href with payment handler */}
            {plan === "premium" ? <span>Current Plan</span> : <Link href="#">Upgrade to Premium</Link>}
          </Button>
        </div>

        {/* BUSINESS */}
        <div className={`rounded-xl border bg-card p-6 ${plan === "business" ? "border-violet-500 ring-2 ring-violet-500/20" : "border-border"}`}>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-violet-500" />
            <h2 className="font-bold text-lg">Business</h2>
            {plan === "business" && (
              <span className="ml-auto text-xs font-medium text-violet-600">Current</span>
            )}
          </div>
          <p className="mt-1 text-3xl font-extrabold">₹799<span className="text-base font-normal text-muted-foreground">/mo</span></p>
          <p className="text-xs text-muted-foreground">Billed monthly</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Everything in Premium</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Employee Accounts (soon)</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Multi-store Staff (soon)</li>
            <li className="flex gap-2"><CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />Priority Support (soon)</li>
          </ul>
          <Button
            className="mt-6 w-full"
            variant="outline"
            disabled={plan === "business"}
            asChild={plan !== "business"}
          >
            {/* TODO: wire to Razorpay */}
            {plan === "business" ? <span>Current Plan</span> : <Link href="#">Upgrade to Business</Link>}
          </Button>
        </div>
      </div>

      {/* Feature comparison table */}
      <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left font-semibold">Feature</th>
              <th className="px-4 py-4 text-center font-semibold text-muted-foreground">Free</th>
              <th className="px-4 py-4 text-center font-semibold text-amber-600">Premium</th>
              <th className="px-4 py-4 text-center font-semibold text-violet-600">Business</th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f, i) => (
              <tr key={f.label} className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-secondary/20"}`}>
                <td className="px-6 py-3 text-muted-foreground">{f.label}</td>
                <td className="px-4 py-3 text-center"><Cell value={f.free} /></td>
                <td className="px-4 py-3 text-center"><Cell value={f.premium} /></td>
                <td className="px-4 py-3 text-center"><Cell value={f.business} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Razorpay note */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Payment integration coming soon. Upgrade buttons will activate Razorpay checkout.
      </p>
    </div>
  );
}
