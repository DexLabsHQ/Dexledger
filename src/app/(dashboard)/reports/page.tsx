import { getCurrentStore } from "@/lib/actions/store";
import { PlanGate } from "@/components/dashboard/plan-gate";
import { hasFeature } from "@/lib/subscription";
import { ReportsView } from "@/components/dashboard/reports-view";
import { PageHeader } from "@/components/dashboard/page-header";
import type { SubscriptionPlan } from "@/lib/types/database";

export default async function ReportsPage() {
  const store = await getCurrentStore();
  if (!store) return null;

  const plan = (store.plan ?? "free") as SubscriptionPlan;

  if (!hasFeature(plan, "csv_export")) {
    return (
      <PlanGate
        featureName="Reports & Exports"
        description="Generate CSV, Excel and WhatsApp reports to stay on top of your business."
        requiredPlan="premium"
        benefits={[
          "CSV inventory and customer export",
          "Excel formatted reports",
          "Daily summary reports",
          "Weekly business digest",
          "WhatsApp report delivery",
        ]}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Export inventory and customer data."
      />
      <ReportsView
        inventoryEnabled={store.inventory_enabled}
        creditEnabled={store.credit_enabled}
      />
    </div>
  );
}
