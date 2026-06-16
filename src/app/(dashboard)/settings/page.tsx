import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BusinessSettingsForm } from "@/components/dashboard/business-settings-form";
import { NotificationSettingsForm } from "@/components/dashboard/notification-settings-form";
import { ProfileSettingsForm } from "@/components/dashboard/profile-settings-form";

export default async function SettingsPage() {
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", userData.user!.id)
    .maybeSingle();

  const { data: notifSettings } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("store_id", store.id)
    .maybeSingle();

  const defaultNotifSettings = {
    whatsapp_enabled: false,
    whatsapp_provider: null,
    low_stock_alerts: true,
    daily_summary: false,
    weekly_summary: true,
    ...(notifSettings ?? {}),
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your business, notifications, and profile." />

      <Tabs defaultValue="business">
        <TabsList className="mb-6">
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Business information</CardTitle>
              <CardDescription>
                Your store name, type, and contact numbers shown across reports and communications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessSettingsForm store={store as unknown as import("@/lib/types/database").StoreRow} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>
                Configure WhatsApp report delivery. Connect your number in the Business tab first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettingsForm
                storeId={store.id}
                settings={defaultNotifSettings}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card className="max-w-lg">
            <CardHeader>
              <CardTitle>Your profile</CardTitle>
              <CardDescription>
                Update the name shown in your DexLedger account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileSettingsForm
                userId={userData.user!.id}
                defaultName={profile?.name ?? ""}
                email={profile?.email ?? userData.user!.email ?? ""}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
