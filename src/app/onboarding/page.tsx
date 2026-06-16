import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    redirect("/login");
  }

  const store = await getCurrentStore();

  if (store?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 px-6 py-12">
      <OnboardingFlow defaultStoreName={store?.store_name ?? ""} />
    </div>
  );
}
