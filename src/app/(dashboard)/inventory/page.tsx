import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { InventoryTable } from "@/components/dashboard/inventory-table";
import type { ProductRow } from "@/lib/types/database";

export default async function InventoryPage() {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  if (!store.inventory_enabled) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("name", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Inventory"
        description={`${products?.length ?? 0} products tracked`}
      />
      <InventoryTable
        products={(products ?? []) as ProductRow[]}
        storeId={store.id}
        expiryEnabled={store.expiry_enabled}
      />
    </div>
  );
}
