// Hand-written Supabase Database type, mirroring supabase/migrations/0001_init.sql
// Regenerate with `supabase gen types typescript` once the project is linked.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
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

          plan?: "free" | "premium" | "business";

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

          plan?: "free" | "premium" | "business";

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

          plan?: "free" | "premium" | "business";

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
          plan?: "free" | "premium" | "business";
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
          plan?: "free" | "premium" | "business";
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
          plan?: "free" | "premium" | "business";
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
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
