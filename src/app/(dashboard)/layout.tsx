import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import type { StoreRow } from "@/lib/types/database";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const store = await getCurrentStore();

  if (!store || !store.onboarding_completed) {
    redirect("/onboarding");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", userData.user.id)
    .maybeSingle();

  // Supabase returns store_type as string; cast to our typed StoreRow.
  // `plan` column added by migration 0002 — defaults to 'free' in DB.
  const typedStore = store as unknown as StoreRow;

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <Sidebar
        store={typedStore}
        userName={profile?.name ?? null}
        userEmail={profile?.email ?? userData.user.email ?? ""}
      />
      <div className="flex min-h-screen flex-1 flex-col lg:pl-64">
        <MobileNav store={typedStore} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
