import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { CustomersTable } from "@/components/dashboard/customers-table";
import type { CustomerWithBalance } from "@/lib/types/database";

export default async function CustomersPage() {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const supabase = await createClient();

  // Fetch customers joined with balance view
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", store.id)
    .order("name", { ascending: true });

  const { data: balances } = await supabase
    .from("customer_balances")
    .select("*")
    .eq("store_id", store.id);

  const balanceMap = new Map(
    (balances ?? []).map((b) => [
      b.customer_id,
      {
        outstanding_balance: Number(b.outstanding_balance ?? 0),
        total_purchases: Number(b.total_purchases ?? 0),
        total_payments: Number(b.total_payments ?? 0),
        last_activity_at: b.last_activity_at,
      },
    ])
  );

  const customersWithBalance: CustomerWithBalance[] = (customers ?? []).map((c) => ({
    ...c,
    outstanding_balance: balanceMap.get(c.id)?.outstanding_balance ?? 0,
    total_purchases: balanceMap.get(c.id)?.total_purchases ?? 0,
    total_payments: balanceMap.get(c.id)?.total_payments ?? 0,
    last_activity_at: balanceMap.get(c.id)?.last_activity_at ?? null,
  }));

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers?.length ?? 0} customer${customers?.length === 1 ? "" : "s"} registered`}
      />
      <CustomersTable customers={customersWithBalance} storeId={store.id} />
    </div>
  );
}
