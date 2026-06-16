"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateBusinessSettings } from "@/lib/actions/store";
import { toast } from "@/lib/toast";
import { BUSINESS_TYPE_LABELS, type BusinessType, type StoreRow } from "@/lib/types/database";

const TYPES = Object.entries(BUSINESS_TYPE_LABELS) as [BusinessType, string][];

export function BusinessSettingsForm({ store }: { store: StoreRow }) {
  const [isPending, startTransition] = useTransition();
  const [storeName, setStoreName] = useState(store.store_name);
  const [storeType, setStoreType] = useState<BusinessType>(store.store_type);
  const [phone, setPhone] = useState(store.phone_number ?? "");
  const [whatsapp, setWhatsapp] = useState(store.whatsapp_number ?? "");

  function handleSave() {
    if (!storeName.trim()) { toast.error("Business name is required."); return; }
    startTransition(async () => {
      const result = await updateBusinessSettings(store.id, {
        storeName,
        storeType,
        phoneNumber: phone,
        whatsappNumber: whatsapp,
      });
      if (result?.error) toast.error("Save failed", result.error);
      else toast.success("Business information saved");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="s-name">Business name</Label>
        <Input id="s-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
      </div>
      <div className="grid gap-1.5">
        <Label>Business type</Label>
        <Select value={storeType} onValueChange={(v) => setStoreType(v as BusinessType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPES.map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="s-phone">Phone number</Label>
        <Input id="s-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="s-wa">WhatsApp number</Label>
        <Input id="s-wa" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 98765 43210" />
        <p className="text-xs text-muted-foreground">Used for WhatsApp report delivery (premium feature).</p>
      </div>
      <Button variant="accent" onClick={handleSave} disabled={isPending}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
