import Link from "next/link";
import { ArrowRight, TrendingUp, Package, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-background to-background" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <Badge variant="accent" className="mb-6">
            Built for local businesses
          </Badge>

          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Track Inventory.
            <br />
            Manage Credit.
            <br />
            <span className="text-accent">Get Paid Faster.</span>
          </h1>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            The modern ledger platform for local businesses — pharmacies, grocery
            stores, hardware shops, distributors, and more. One dashboard for
            stock, customers, and udhaar.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="accent" asChild>
              <Link href="/signup">
                Start Free Trial <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            No credit card required · Set up in under 5 minutes
          </p>
        </div>

        {/* Signature element: live ledger snapshot */}
        <div className="relative">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sharma General Store</p>
                <p className="text-lg font-semibold">Today&apos;s Ledger</p>
              </div>
              <Badge variant="success">All synced</Badge>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-secondary p-3">
                <Package className="mb-2 size-4 text-accent" />
                <p className="text-xl font-semibold">1,248</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <IndianRupee className="mb-2 size-4 text-destructive" />
                <p className="text-xl font-semibold">₹42,650</p>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </div>
              <div className="rounded-lg bg-secondary p-3">
                <TrendingUp className="mb-2 size-4 text-success" />
                <p className="text-xl font-semibold">+18%</p>
                <p className="text-xs text-muted-foreground">This week</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { name: "Ramesh Traders", note: "Paid ₹2,000", amount: "+₹2,000", positive: true },
                { name: "Maya Stores", note: "Purchase on credit", amount: "-₹850", positive: false },
                { name: "Anil Kumar", note: "Paid ₹1,200", amount: "+₹1,200", positive: true },
              ].map((row) => (
                <div key={row.name} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.note}</p>
                  </div>
                  <span className={row.positive ? "text-sm font-semibold text-success" : "text-sm font-semibold text-destructive"}>
                    {row.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card px-4 py-3 shadow-lg sm:block">
            <p className="text-xs text-muted-foreground">Low stock alert</p>
            <p className="text-sm font-semibold">Paracetamol 500mg — 4 left</p>
          </div>
        </div>
      </div>
    </section>
  );
}
