// Hand-written Supabase Database type.
// Mirrors all migrations: 0001_init.sql + 0002_subscriptions.sql + 0003_razorpay_subscriptions.sql
// Regenerate with `supabase gen types typescript` once the project is linked.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SubscriptionPlanEnum = "free" | "premium" | "business";

export interface Database {
  public: {
    Tables: {
      // ── users ──────────────────────────────────────────────────────────────
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      // ── stores ─────────────────────────────────────────────────────────────
      stores: {
        Row: {
          id: string;
          owner_id: string;
          store_name: string;
          store_type: string;
          phone_number: string | null;
          whatsapp_number: string | null;
          inventory_enabled: boolean;
          credit_enabled: boolean;
          expiry_enabled: boolean;
          onboarding_completed: boolean;
          plan: SubscriptionPlanEnum;       // added by 0002
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          store_name: string;
          store_type: string;
          phone_number?: string | null;
          whatsapp_number?: string | null;
          inventory_enabled?: boolean;
          credit_enabled?: boolean;
          expiry_enabled?: boolean;
          onboarding_completed?: boolean;
          plan?: SubscriptionPlanEnum;
          created_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          store_name?: string;
          store_type?: string;
          phone_number?: string | null;
          whatsapp_number?: string | null;
          inventory_enabled?: boolean;
          credit_enabled?: boolean;
          expiry_enabled?: boolean;
          onboarding_completed?: boolean;
          plan?: SubscriptionPlanEnum;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── products ───────────────────────────────────────────────────────────
      products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          category?: string | null;
          quantity?: number;
          low_stock_threshold?: number;
          expiry_date?: string | null;
          unit?: string | null;
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          category?: string | null;
          quantity?: number;
          low_stock_threshold?: number;
          expiry_date?: string | null;
          unit?: string | null;
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── customers ──────────────────────────────────────────────────────────
      customers: {
        Row: {
          id: string;
          store_id: string;
          name: string;
          phone: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          name: string;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          name?: string;
          phone?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "customers_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── ledger_entries ─────────────────────────────────────────────────────
      ledger_entries: {
        Row: {
          id: string;
          store_id: string;
          customer_id: string;
          type: string;
          amount: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          customer_id: string;
          type: string;
          amount: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          customer_id?: string;
          type?: string;
          amount?: number;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ledger_entries_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "ledger_entries_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── activities ─────────────────────────────────────────────────────────
      activities: {
        Row: {
          id: string;
          store_id: string;
          activity_type: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          activity_type: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          activity_type?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activities_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── notification_settings ──────────────────────────────────────────────
      notification_settings: {
        Row: {
          id: string;
          store_id: string;
          whatsapp_enabled: boolean;
          whatsapp_provider: string | null;
          low_stock_alerts: boolean;
          daily_summary: boolean;
          weekly_summary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          whatsapp_enabled?: boolean;
          whatsapp_provider?: string | null;
          low_stock_alerts?: boolean;
          daily_summary?: boolean;
          weekly_summary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          whatsapp_enabled?: boolean;
          whatsapp_provider?: string | null;
          low_stock_alerts?: boolean;
          daily_summary?: boolean;
          weekly_summary?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_settings_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: true;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── subscription_events ────────────────────────────────────────────────
      // Added by 0002_subscriptions.sql, extended by 0003_razorpay_subscriptions.sql
      subscription_events: {
        Row: {
          id: string;
          store_id: string;
          plan: SubscriptionPlanEnum;
          source: string;                       // 'manual' | 'razorpay' | 'admin'
          razorpay_order_id: string | null;     // original 0002 column
          razorpay_payment_id: string | null;   // original 0002 column
          razorpay_subscription_id: string | null; // added by 0003
          razorpay_event_id: string | null;     // added by 0003 — idempotency key (unique)
          event_type: string | null;            // added by 0003 — e.g. 'subscription.charged'
          status: string | null;                // added by 0003 — snapshot at event time
          created_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          plan: SubscriptionPlanEnum;
          source?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_subscription_id?: string | null;
          razorpay_event_id?: string | null;
          event_type?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          plan?: SubscriptionPlanEnum;
          source?: string;
          razorpay_order_id?: string | null;
          razorpay_payment_id?: string | null;
          razorpay_subscription_id?: string | null;
          razorpay_event_id?: string | null;
          event_type?: string | null;
          status?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_events_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: false;
            referencedRelation: "stores";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── razorpay_subscriptions ─────────────────────────────────────────────
      // Added by 0003_razorpay_subscriptions.sql
      // One active row per store. Tracks live Razorpay subscription state.
      razorpay_subscriptions: {
        Row: {
          id: string;
          store_id: string;
          razorpay_subscription_id: string;
          razorpay_plan_id: string;
          status: string;
          // Razorpay statuses: created | authenticated | active | pending
          //                    | halted | cancelled | completed | expired
          current_start: string | null;
          current_end: string | null;
          charge_at: string | null;
          total_count: number | null;
          paid_count: number;
          remaining_count: number | null;
          short_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          razorpay_subscription_id: string;
          razorpay_plan_id: string;
          status?: string;
          current_start?: string | null;
          current_end?: string | null;
          charge_at?: string | null;
          total_count?: number | null;
          paid_count?: number;
          remaining_count?: number | null;
          short_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_id?: string;
          razorpay_subscription_id?: string;
          razorpay_plan_id?: string;
          status?: string;
          current_start?: string | null;
          current_end?: string | null;
          charge_at?: string | null;
          total_count?: number | null;
          paid_count?: number;
          remaining_count?: number | null;
          short_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "razorpay_subscriptions_store_id_fkey";
            columns: ["store_id"];
            isOneToOne: true;             // unique constraint on store_id
            referencedRelation: "stores";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: {
      customer_balances: {
        Row: {
          customer_id: string;
          store_id: string;
          total_purchases: number;
          total_payments: number;
          outstanding_balance: number;
          last_activity_at: string | null;
        };
        Relationships: [];
      };
    };

    Functions: {
      get_dashboard_stats: {
        Args: { p_store_id: string };
        Returns: {
          total_products: number;
          low_stock_products: number;
          total_customers: number;
          outstanding_credit: number;
        }[];
      };
      get_plan_limits: {
        Args: { p_plan: SubscriptionPlanEnum };
        Returns: Json;
      };
      owns_store: {
        Args: { p_store_id: string };
        Returns: boolean;
      };
    };

    Enums: {
      subscription_plan: SubscriptionPlanEnum;
      business_type:
        | "pharmacy"
        | "grocery_store"
        | "hardware_store"
        | "stationery_shop"
        | "cement_supplier"
        | "distributor"
        | "warehouse"
        | "other";
      ledger_entry_type: "purchase" | "payment";
      activity_type:
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
    };

    CompositeTypes: Record<string, never>;
  };
}