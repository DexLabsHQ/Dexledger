"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateNotificationSettings } from "@/lib/actions/store";
import { toast } from "@/lib/toast";
import { AVAILABLE_WHATSAPP_PROVIDERS } from "@/lib/whatsapp";

interface NotificationSettingsRow {
  whatsapp_enabled: boolean;
  whatsapp_provider: string | null;
  low_stock_alerts: boolean;
  daily_summary: boolean;
  weekly_summary: boolean;
}

export function NotificationSettingsForm({
  storeId,
  settings,
}: {
  storeId: string;
  settings: NotificationSettingsRow;
}) {
  const [isPending, startTransition] = useTransition();
  const [waEnabled, setWaEnabled] = useState(settings.whatsapp_enabled);
  const [provider, setProvider] = useState(settings.whatsapp_provider ?? "");
  const [lowStock, setLowStock] = useState(settings.low_stock_alerts);
  const [daily, setDaily] = useState(settings.daily_summary);
  const [weekly, setWeekly] = useState(settings.weekly_summary);

  function handleSave() {
    startTransition(async () => {
      const result = await updateNotificationSettings(storeId, {
        whatsappEnabled: waEnabled,
        whatsappProvider: provider || null,
        lowStockAlerts: lowStock,
        dailySummary: daily,
        weeklySummary: weekly,
      });
      if (result?.error) toast.error("Save failed", result.error);
      else toast.success("Notification preferences saved");
    });
  }

  return (
    <div className="space-y-5">
      {/* WhatsApp Toggle */}
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <Label className="text-sm font-medium">Enable WhatsApp delivery</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive reports directly on your WhatsApp number (premium feature).
          </p>
        </div>
        <Switch checked={waEnabled} onCheckedChange={setWaEnabled} />
      </div>

      {waEnabled && (
        <div className="grid gap-1.5">
          <Label>WhatsApp provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select a provider" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_WHATSAPP_PROVIDERS.map((p) => (
                <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Configure provider API keys in your server environment variables.
          </p>
        </div>
      )}

      {/* Alert toggles */}
      <div className="space-y-3 rounded-lg border border-border p-4">
        <p className="text-sm font-medium">What to send</p>
        {[
          { id: "low-stock", label: "Low stock alerts", desc: "When a product drops below its threshold.", value: lowStock, setter: setLowStock },
          { id: "daily", label: "Daily summary", desc: "A brief daily snapshot of your store.", value: daily, setter: setDaily },
          { id: "weekly", label: "Weekly summary", desc: "A weekly overview of inventory and credit.", value: weekly, setter: setWeekly },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div>
              <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">{item.label}</Label>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <Switch id={item.id} checked={item.value} onCheckedChange={item.setter} />
          </div>
        ))}
      </div>

      <Button variant="accent" onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save preferences"}
      </Button>
    </div>
  );
}
