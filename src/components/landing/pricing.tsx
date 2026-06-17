import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "For new shops getting started with digital records.",
    features: [
      "Up to 100 products",
      "Up to 50 customers",
      "Inventory & credit tracking",
      "Basic reports (CSV export)",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "₹299",
    period: "per month",
    description: "For established businesses with daily transactions.",
    features: [
      "Unlimited products & customers",
      "Expiry tracking",
      "Excel & CSV exports",
      "WhatsApp report delivery",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Business",
    price: "Custom",
    period: "contact us",
    description: "For distributors and warehouses with multiple staff.",
    features: [
      "Everything in Growth",
      "Employee accounts (coming soon)",
      "Multi-store support (coming soon)",
      "Dedicated onboarding",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border/60 bg-secondary/40 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Start free. Upgrade when WhatsApp reports and unlimited records
            become essential to your day.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "flex flex-col rounded-2xl border bg-card p-8",
                plan.highlighted
                  ? "border-accent shadow-lg shadow-accent/10 ring-1 ring-accent/20"
                  : "border-border"
              )}
            >
              {plan.highlighted && (
                <span className="mb-3 inline-flex w-fit items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-6 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-8"
                variant={plan.highlighted ? "accent" : "outline"}
                asChild
              >
                <Link href="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
