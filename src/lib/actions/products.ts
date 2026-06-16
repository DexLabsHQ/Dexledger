"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

export interface ProductPayload {
  name: string;
  category: string;
  quantity: number;
  lowStockThreshold: number;
  expiryDate: string | null;
  unit: string;
  price: number | null;
}

export async function createProduct(storeId: string, payload: ProductPayload): Promise<ActionResult> {
  if (!payload.name.trim()) return { error: "Product name is required." };

  const supabase = await createClient();

  const { error } = await supabase.from("products").insert({
    store_id: storeId,
    name: payload.name.trim(),
    category: payload.category.trim() || null,
    quantity: payload.quantity,
    low_stock_threshold: payload.lowStockThreshold,
    expiry_date: payload.expiryDate,
    unit: payload.unit.trim() || null,
    price: payload.price,
  });

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "product_added",
    description: `Added product "${payload.name.trim()}"`,
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return {};
}

export async function updateProduct(
  storeId: string,
  productId: string,
  payload: ProductPayload
): Promise<ActionResult> {
  if (!payload.name.trim()) return { error: "Product name is required." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({
      name: payload.name.trim(),
      category: payload.category.trim() || null,
      quantity: payload.quantity,
      low_stock_threshold: payload.lowStockThreshold,
      expiry_date: payload.expiryDate,
      unit: payload.unit.trim() || null,
      price: payload.price,
    })
    .eq("id", productId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "product_updated",
    description: `Updated product "${payload.name.trim()}"`,
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteProduct(storeId: string, productId: string, productName: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("store_id", storeId);

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    store_id: storeId,
    activity_type: "product_deleted",
    description: `Deleted product "${productName}"`,
  });

  revalidatePath("/inventory");
  revalidatePath("/dashboard");
  return {};
}
