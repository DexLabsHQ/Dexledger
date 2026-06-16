"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";
import type { LedgerEntryType } from "@/lib/types/database";

export interface CustomerPayload {
  name: string;
  phone: string;
  notes: string;
}

export async function createCustomer(storeId: string, payload: CustomerPayload): Promise<ActionResult> {
  if (!payload.name.trim()) return { error: "Customer name is required." };

  const supabase = await createClient();

  const { error } = await supabase.from("customers").insert({
    store_id: storeId,
    name: payload.name.trim(),
    phone: payload.phone.trim() || null,
    notes: payload.notes.trim() || null,
  });

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "customer_added",
    description: `Added customer "${payload.name.trim()}"`,
  });

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return {};
}

export async function updateCustomer(
  storeId: string,
  customerId: string,
  payload: CustomerPayload
): Promise<ActionResult> {
  if (!payload.name.trim()) return { error: "Customer name is required." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .update({
      name: payload.name.trim(),
      phone: payload.phone.trim() || null,
      notes: payload.notes.trim() || null,
    })
    .eq("id", customerId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "customer_updated",
    description: `Updated customer "${payload.name.trim()}"`,
  });

  revalidatePath("/customers");
  return {};
}

export async function deleteCustomer(storeId: string, customerId: string, customerName: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "customer_deleted",
    description: `Deleted customer "${customerName}"`,
  });

  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return {};
}

export interface LedgerEntryPayload {
  customerId: string;
  customerName: string;
  type: LedgerEntryType;
  amount: number;
  description: string;
}

export async function createLedgerEntry(storeId: string, payload: LedgerEntryPayload): Promise<ActionResult> {
  if (!payload.customerId) return { error: "Select a customer." };
  if (!payload.amount || payload.amount <= 0) return { error: "Amount must be greater than zero." };

  const supabase = await createClient();

  const { error } = await supabase.from("ledger_entries").insert({
    store_id: storeId,
    customer_id: payload.customerId,
    type: payload.type,
    amount: payload.amount,
    description: payload.description.trim() || null,
  });

  if (error) return { error: error.message };

  const verb = payload.type === "purchase" ? "Recorded purchase" : "Recorded payment";
  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: payload.type === "purchase" ? "ledger_purchase" : "ledger_payment",
    description: `${verb} of ₹${payload.amount.toFixed(2)} for ${payload.customerName}`,
  });

  revalidatePath("/credit");
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteLedgerEntry(storeId: string, entryId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ledger_entries")
    .delete()
    .eq("id", entryId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  revalidatePath("/credit");
  revalidatePath("/customers");
  revalidatePath("/dashboard");
  return {};
}
