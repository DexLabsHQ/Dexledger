import {
  Package,
  Users,
  Wallet,
  BarChart3,
  MessageCircle,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Inventory tracking",
    description:
      "Add products, set low-stock thresholds, and track expiry dates. Get notified before you run out.",
  },
  {
    icon: Users,
    title: "Customer records",
    description:
      "Keep a profile for every regular customer — contact details, notes, and full transaction history.",
  },
  {
    icon: Wallet,
    title: "Credit & udhaar ledger",
    description:
      "Record purchases and payments. Outstanding balances are calculated automatically — never manually tracked.",
  },
  {
    icon: BarChart3,
    title: "Business reports",
    description:
      "Generate low stock, outstanding credit, inventory, and customer summary reports — export to CSV or Excel.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp delivery",
    description:
      "Get daily and weekly summaries sent straight to your WhatsApp. No need to log in to check on your shop.",
  },
  {
    icon: Bell,
    title: "Low stock alerts",
    description:
      "Highlighted dashboards and reports flag exactly what needs restocking, so nothing slips through.",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-border/60 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything your shop needs, in one place
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            DexLedger replaces the notebook, the calculator, and the group chat
            reminders — with one clean, reliable system.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <feature.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
