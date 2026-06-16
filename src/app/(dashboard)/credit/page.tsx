import { getCurrentStore } from "@/lib/actions/store";
import { PlanGate } from "@/components/dashboard/plan-gate";
import { hasFeature } from "@/lib/subscription";
import type {
  SubscriptionPlan,
  CustomerWithBalance,
} from "@/lib/types/database";

import { CreditLedgerView } from "@/components/dashboard/credit-ledger-view";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/dashboard/page-header";

export default async function CreditPage() {
  const store = await getCurrentStore();
  if (!store) return null;

  const plan = (store.plan ?? "free") as SubscriptionPlan;

  // Free users are stopped here.
  if (!hasFeature(plan, "credit")) {
    return (
      <PlanGate
        featureName="Credit & Udhaar"
        description="Track credit, record purchases, and manage customer payments with ease."
        requiredPlan="premium"
        benefits={[
          "Unlimited customer credit tracking",
          "Record purchases and payments",
          "Full ledger history per customer",
          "Outstanding balance overview",
          "WhatsApp payment reminders",
        ]}
      />
    );
  }

  const supabase = await createClient();

  // Fetch customers
  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("store_id", store.id)
    .order("name");

  // Fetch balances from the VIEW separately
  const { data: balances } = await supabase
    .from("customer_balances")
    .select("*")
    .eq("store_id", store.id);

  const balanceMap = new Map(
    (balances ?? []).map((balance) => [balance.customer_id, balance])
  );

  const customersWithBalance: CustomerWithBalance[] = (customers ?? []).map(
    (customer) => {
      const balance = balanceMap.get(customer.id);

      return {
        ...customer,
        outstanding_balance: balance?.outstanding_balance ?? 0,
        total_purchases: balance?.total_purchases ?? 0,
        total_payments: balance?.total_payments ?? 0,
        last_activity_at: balance?.last_activity_at ?? null,
      };
    }
  );

  return (
    <div>
      <PageHeader
        title="Credit / Udhaar"
        description="Track customer credit and record transactions."
      />

      <CreditLedgerView
        storeId={store.id}
        customers={customersWithBalance}
      />
    </div>
  );
}