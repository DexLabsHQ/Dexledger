"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BusinessType } from "@/lib/types/database";
import type { ActionResult } from "./auth";

/** Fetches the current user's store. Returns null if not found or not onboarded. */
export async function getCurrentStore() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data: store } = await supabase
    .from("stores")
    .select("*")                      // includes `plan` column added by migration 0002
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  return store;
}

export interface OnboardingPayload {
  storeName: string;
  storeType: BusinessType;
  inventoryEnabled: boolean;
  creditEnabled: boolean;
  expiryEnabled: boolean;
}

/** Creates (or updates) the tenant store and marks onboarding complete. */
export async function completeOnboarding(payload: OnboardingPayload): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return { error: "You must be signed in." };
  if (!payload.storeName.trim()) return { error: "Business name is required." };

  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("owner_id", userData.user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("stores")
      .update({
        store_name: payload.storeName.trim(),
        store_type: payload.storeType,
        inventory_enabled: payload.inventoryEnabled,
        credit_enabled: payload.creditEnabled,
        expiry_enabled: payload.expiryEnabled,
        onboarding_completed: true,
      })
      .eq("id", existing.id);

    if (error) return { error: error.message };
  } else {
    const { data: newStore, error } = await supabase
      .from("stores")
      .insert({
        owner_id: userData.user.id,
        store_name: payload.storeName.trim(),
        store_type: payload.storeType,
        inventory_enabled: payload.inventoryEnabled,
        credit_enabled: payload.creditEnabled,
        expiry_enabled: payload.expiryEnabled,
        onboarding_completed: true,
        // plan defaults to 'free' in DB
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    if (newStore) {
      await supabase.from("notification_settings").insert({ store_id: newStore.id });
    }
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export interface BusinessSettingsPayload {
  storeName: string;
  storeType: BusinessType;
  phoneNumber: string;
  whatsappNumber: string;
}

export async function updateBusinessSettings(
  storeId: string,
  payload: BusinessSettingsPayload
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("stores")
    .update({
      store_name: payload.storeName.trim(),
      store_type: payload.storeType,
      phone_number: payload.phoneNumber.trim() || null,
      whatsapp_number: payload.whatsappNumber.trim() || null,
    })
    .eq("id", storeId);

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "settings_updated",
    description: "Business information updated",
  });

  revalidatePath("/settings");
  return {};
}

export interface NotificationSettingsPayload {
  whatsappEnabled: boolean;
  whatsappProvider: string | null;
  lowStockAlerts: boolean;
  dailySummary: boolean;
  weeklySummary: boolean;
}

export async function updateNotificationSettings(
  storeId: string,
  payload: NotificationSettingsPayload
): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notification_settings")
    .update({
      whatsapp_enabled: payload.whatsappEnabled,
      whatsapp_provider: payload.whatsappProvider,
      low_stock_alerts: payload.lowStockAlerts,
      daily_summary: payload.dailySummary,
      weekly_summary: payload.weeklySummary,
    })
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "settings_updated",
    description: "Notification preferences updated",
  });

  revalidatePath("/settings");
  return {};
}

export interface ProfilePayload {
  name: string;
}

export async function updateProfile(userId: string, payload: ProfilePayload): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("users")
    .update({ name: payload.name.trim() })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return {};
}
