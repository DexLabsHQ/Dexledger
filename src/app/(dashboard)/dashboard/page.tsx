import Link from "next/link";
import { Package, Users, Wallet, AlertTriangle, ArrowRight, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { PlanCard } from "@/components/dashboard/plan-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActivityRow, ProductRow, SubscriptionPlan } from "@/lib/types/database";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function activityIcon(type: string) {
  if (type.startsWith("product")) return "📦";
  if (type.startsWith("customer")) return "👤";
  if (type === "ledger_purchase") return "🛒";
  if (type === "ledger_payment") return "💰";
  if (type === "report_generated") return "📊";
  if (type === "whatsapp_sent") return "📱";
  return "⚙️";
}

export default async function DashboardPage() {
  const store = await getCurrentStore();
  if (!store) return null;

  const plan = (store.plan ?? "free") as SubscriptionPlan;
  const supabase = await createClient();

  // Dashboard stats via PostgreSQL function
  const { data: statsRows } = await supabase.rpc("get_dashboard_stats", {
    p_store_id: store.id,
  });
  const stats = statsRows?.[0] ?? {
    total_products: 0,
    low_stock_products: 0,
    total_customers: 0,
    outstanding_credit: 0,
  };

  // Recent activities (last 10)
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Low-stock products
  const { data: allProducts } = await supabase
    .from("products")
    .select("id, name, quantity, low_stock_threshold, unit, category")
    .eq("store_id", store.id)
    .order("quantity", { ascending: true })
    .limit(50);

  const lowStockFiltered = (allProducts ?? [])
    .filter((p) => p.quantity <= p.low_stock_threshold)
    .slice(0, 5) as ProductRow[];

  return (
    <div>
      <PageHeader
        title={`Good day, ${store.store_name}`}
        description="Here's what's happening in your store today."
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {store.inventory_enabled && (
          <>
            <StatCard
              title="Total Products"
              value={stats.total_products ?? 0}
              icon={Package}
              description="In your inventory"
              variant="default"
            />
            <StatCard
              title="Low Stock Items"
              value={stats.low_stock_products ?? 0}
              icon={AlertTriangle}
              description="Below threshold"
              variant={Number(stats.low_stock_products) > 0 ? "warning" : "default"}
            />
          </>
        )}
        {store.credit_enabled && (
          <>
            <StatCard
              title="Total Customers"
              value={stats.total_customers ?? 0}
              icon={Users}
              description="Registered customers"
              variant="default"
            />
            <StatCard
              title="Outstanding Credit"
              value={formatCurrency(Number(stats.outstanding_credit ?? 0))}
              icon={Wallet}
              description="Total udhaar balance"
              variant={Number(stats.outstanding_credit) > 0 ? "danger" : "success"}
            />
          </>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Activity className="size-4 text-accent" />
                <h2 className="font-semibold">Recent Activity</h2>
              </div>
            </div>

            {!activities || activities.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No activity yet. Start by adding products or customers.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {(activities as ActivityRow[]).map((a) => (
                  <div key={a.id} className="flex items-start gap-3 px-6 py-3.5">
                    <span className="mt-0.5 text-base">{activityIcon(a.activity_type)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">{a.description}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {timeAgo(a.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Low Stock + Plan Card */}
        <div className="flex flex-col gap-6">
          {/* Low Stock */}
          {store.inventory_enabled && (
            <div className="rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-destructive" />
                  <h2 className="font-semibold">Low Stock</h2>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/inventory">
                    View all <ArrowRight className="size-3" />
                  </Link>
                </Button>
              </div>

              {lowStockFiltered.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  All products are well-stocked.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {lowStockFiltered.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.category ?? "Uncategorised"}
                        </p>
                      </div>
                      <Badge variant="warning" className="ml-2 shrink-0">
                        {p.quantity} {p.unit ?? "left"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Plan Card */}
          <PlanCard
            plan={plan}
            productCount={Number(stats.total_products ?? 0)}
            customerCount={Number(stats.total_customers ?? 0)}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {store.inventory_enabled && (
          <Link
            href="/inventory"
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent/40 hover:bg-secondary/50"
          >
            <Package className="size-5 text-accent" />
            <div>
              <p className="text-sm font-medium">Manage Inventory</p>
              <p className="text-xs text-muted-foreground">Add or edit products</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-muted-foreground" />
          </Link>
        )}
        {store.credit_enabled && (
          <Link
            href="/customers"
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent/40 hover:bg-secondary/50"
          >
            <Users className="size-5 text-accent" />
            <div>
              <p className="text-sm font-medium">View Customers</p>
              <p className="text-xs text-muted-foreground">Manage customer records</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-muted-foreground" />
          </Link>
        )}
        {store.credit_enabled && (
          <Link
            href="/credit"
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-accent/40 hover:bg-secondary/50"
          >
            <Wallet className="size-5 text-accent" />
            <div>
              <p className="text-sm font-medium">Record Transaction</p>
              <p className="text-xs text-muted-foreground">Add purchase or payment</p>
            </div>
            <ArrowRight className="ml-auto size-4 text-muted-foreground" />
          </Link>
        )}
      </div>
    </div>
  );
}
