"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "./store";

export type ReportType =
  | "low_stock"
  | "outstanding_credit"
  | "inventory_summary"
  | "customer_summary";

/** Generates report data and returns it as a CSV string. */
export async function generateReportCSV(reportType: ReportType): Promise<{
  csv?: string;
  filename?: string;
  error?: string;
}> {
  const store = await getCurrentStore();
  if (!store) return { error: "Not authenticated." };

  const supabase = await createClient();

  try {
    if (reportType === "low_stock") {
      const { data: products, error } = await supabase
        .from("products")
        .select("name, category, quantity, low_stock_threshold, unit, expiry_date")
        .eq("store_id", store.id)
        .order("quantity", { ascending: true });

      if (error) return { error: error.message };

      const lowStock = (products ?? []).filter(
        (p) => p.quantity <= p.low_stock_threshold
      );

      const headers = ["Product", "Category", "Unit", "Quantity", "Threshold", "Expiry Date"];
      const rows = lowStock.map((p) => [
        p.name,
        p.category ?? "",
        p.unit ?? "",
        String(p.quantity),
        String(p.low_stock_threshold),
        p.expiry_date ?? "",
      ]);

      await supabase.from("activities").insert({
        store_id: store.id,
        activity_type: "report_generated",
        description: "Generated Low Stock Report",
      });

      return {
        csv: [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n"),
        filename: `low_stock_report_${datestamp()}.csv`,
      };
    }

    if (reportType === "outstanding_credit") {
      const { data: customers } = await supabase
        .from("customers")
        .select("id, name, phone")
        .eq("store_id", store.id)
        .order("name", { ascending: true });

      const { data: balances } = await supabase
        .from("customer_balances")
        .select("*")
        .eq("store_id", store.id);

      const balanceMap = new Map((balances ?? []).map((b) => [b.customer_id, b]));

      const headers = ["Customer", "Phone", "Total Purchases", "Total Paid", "Outstanding Balance"];
      const rows = (customers ?? []).map((c) => {
        const b = balanceMap.get(c.id);
        return [
          c.name,
          c.phone ?? "",
          b ? String(b.total_purchases) : "0",
          b ? String(b.total_payments) : "0",
          b ? String(b.outstanding_balance) : "0",
        ];
      });

      await supabase.from("activities").insert({
        store_id: store.id,
        activity_type: "report_generated",
        description: "Generated Outstanding Credit Report",
      });

      return {
        csv: [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n"),
        filename: `outstanding_credit_${datestamp()}.csv`,
      };
    }

    if (reportType === "inventory_summary") {
      const { data: products } = await supabase
        .from("products")
        .select("name, category, unit, quantity, low_stock_threshold, price, expiry_date, created_at")
        .eq("store_id", store.id)
        .order("name", { ascending: true });

      const headers = ["Product", "Category", "Unit", "Quantity", "Low Stock Threshold", "Price (₹)", "Expiry Date", "Added On"];
      const rows = (products ?? []).map((p) => [
        p.name,
        p.category ?? "",
        p.unit ?? "",
        String(p.quantity),
        String(p.low_stock_threshold),
        p.price !== null ? String(p.price) : "",
        p.expiry_date ?? "",
        new Date(p.created_at).toLocaleDateString("en-IN"),
      ]);

      await supabase.from("activities").insert({
        store_id: store.id,
        activity_type: "report_generated",
        description: "Generated Inventory Summary",
      });

      return {
        csv: [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n"),
        filename: `inventory_summary_${datestamp()}.csv`,
      };
    }

    if (reportType === "customer_summary") {
      const { data: customers } = await supabase
        .from("customers")
        .select("name, phone, notes, created_at")
        .eq("store_id", store.id)
        .order("name", { ascending: true });

      const { data: balances } = await supabase
        .from("customer_balances")
        .select("*")
        .eq("store_id", store.id);

      const balanceMap = new Map((balances ?? []).map((b) => [b.customer_id, b]));

      const headers = ["Customer", "Phone", "Notes", "Outstanding Balance", "Total Purchases", "Total Paid", "Last Activity", "Added On"];
      const rows = (customers ?? []).map((c, idx) => {
        const customerId = (balances ?? [])[idx]?.customer_id;
        const b = customerId ? balanceMap.get(customerId) : null;
        return [
          c.name,
          c.phone ?? "",
          c.notes ?? "",
          b ? String(b.outstanding_balance) : "0",
          b ? String(b.total_purchases) : "0",
          b ? String(b.total_payments) : "0",
          b?.last_activity_at ? new Date(b.last_activity_at).toLocaleDateString("en-IN") : "",
          new Date(c.created_at).toLocaleDateString("en-IN"),
        ];
      });

      await supabase.from("activities").insert({
        store_id: store.id,
        activity_type: "report_generated",
        description: "Generated Customer Summary",
      });

      return {
        csv: [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n"),
        filename: `customer_summary_${datestamp()}.csv`,
      };
    }

    return { error: "Unknown report type." };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "An unknown error occurred." };
  }
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function datestamp() {
  return new Date().toISOString().slice(0, 10);
}
