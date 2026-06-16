// Core domain types mirroring the Supabase Postgres schema.
// Keep in sync with supabase/migrations/*.sql

export type BusinessType =
  | "pharmacy"
  | "grocery_store"
  | "hardware_store"
  | "stationery_shop"
  | "cement_supplier"
  | "distributor"
  | "warehouse"
  | "other";

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  pharmacy: "Pharmacy",
  grocery_store: "Grocery Store",
  hardware_store: "Hardware Store",
  stationery_shop: "Stationery Shop",
  cement_supplier: "Cement Supplier",
  distributor: "Distributor",
  warehouse: "Warehouse",
  other: "Other",
};

export type LedgerEntryType = "purchase" | "payment";

// ── Subscription ──────────────────────────────────────────────────────────────
export type SubscriptionPlan = "free" | "premium" | "business";

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  premium: "Premium",
  business: "Business",
};

/** Feature limits per plan. -1 means unlimited. */
export interface PlanLimits {
  max_products: number;
  max_customers: number;
  credit: boolean;
  customer_ledger: boolean;
  csv_export: boolean;
  excel_export: boolean;
  whatsapp: boolean;
  weekly_reports: boolean;
  daily_reports: boolean;
  employee_accounts: boolean;
  multi_store_staff: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  free: {
    max_products: 50,
    max_customers: 25,
    credit: false,
    customer_ledger: false,
    csv_export: false,
    excel_export: false,
    whatsapp: false,
    weekly_reports: false,
    daily_reports: false,
    employee_accounts: false,
    multi_store_staff: false,
  },
  premium: {
    max_products: -1,
    max_customers: -1,
    credit: true,
    customer_ledger: true,
    csv_export: true,
    excel_export: true,
    whatsapp: true,
    weekly_reports: true,
    daily_reports: true,
    employee_accounts: false,
    multi_store_staff: false,
  },
  business: {
    max_products: -1,
    max_customers: -1,
    credit: true,
    customer_ledger: true,
    csv_export: true,
    excel_export: true,
    whatsapp: true,
    weekly_reports: true,
    daily_reports: true,
    employee_accounts: true,
    multi_store_staff: true,
  },
};

// ── Rows ─────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

export interface StoreRow {
  id: string;
  owner_id: string;
  store_name: string;
  store_type: BusinessType;
  phone_number: string | null;
  whatsapp_number: string | null;
  inventory_enabled: boolean;
  credit_enabled: boolean;
  expiry_enabled: boolean;
  onboarding_completed: boolean;
  plan: SubscriptionPlan;            // ← NEW
  created_at: string;
}

export interface ProductRow {
  id: string;
  store_id: string;
  name: string;
  category: string | null;
  quantity: number;
  low_stock_threshold: number;
  expiry_date: string | null;
  unit: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface LedgerEntryRow {
  id: string;
  store_id: string;
  customer_id: string;
  type: LedgerEntryType;
  amount: number;
  description: string | null;
  created_at: string;
}

export type ActivityType =
  | "product_added"
  | "product_updated"
  | "product_deleted"
  | "stock_adjusted"
  | "customer_added"
  | "customer_updated"
  | "customer_deleted"
  | "ledger_purchase"
  | "ledger_payment"
  | "report_generated"
  | "whatsapp_sent"
  | "settings_updated";

export interface ActivityRow {
  id: string;
  store_id: string;
  activity_type: ActivityType;
  description: string;
  created_at: string;
}

export interface SubscriptionEventRow {
  id: string;
  store_id: string;
  plan: SubscriptionPlan;
  source: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

// ── Derived / computed view models ───────────────────────────────────────────

export interface CustomerWithBalance extends CustomerRow {
  outstanding_balance: number;
  total_purchases: number;
  total_payments: number;
  last_activity_at: string | null;
}

export interface DashboardStats {
  total_products: number;
  low_stock_products: number;
  total_customers: number;
  outstanding_credit: number;
}
