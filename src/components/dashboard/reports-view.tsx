"use client";

import { useState, useTransition } from "react";
import {
  Package, Wallet, Users, FileBarChart, Download, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { generateReportCSV, type ReportType } from "@/lib/actions/reports";
import { toast } from "@/lib/toast";

interface ReportCard {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ElementType;
  badge?: string;
  requiresCredit?: boolean;
  requiresInventory?: boolean;
}

const REPORTS: ReportCard[] = [
  {
    type: "low_stock",
    title: "Low Stock Report",
    description: "All products currently at or below their low stock threshold. Use this to plan your next restock order.",
    icon: AlertTriangle,
    badge: "Inventory",
    requiresInventory: true,
  },
  {
    type: "outstanding_credit",
    title: "Outstanding Credit Report",
    description: "Full list of customers with unpaid balances, sorted by amount owed. Great for collections follow-up.",
    icon: Wallet,
    badge: "Credit",
    requiresCredit: true,
  },
  {
    type: "inventory_summary",
    title: "Inventory Summary",
    description: "Complete list of all products with quantities, prices, and expiry dates.",
    icon: Package,
    badge: "Inventory",
    requiresInventory: true,
  },
  {
    type: "customer_summary",
    title: "Customer Summary",
    description: "Overview of all customers with their total purchases, payments, and outstanding balances.",
    icon: Users,
    badge: "Customers",
  },
];

interface ReportsViewProps {
  inventoryEnabled: boolean;
  creditEnabled: boolean;
}

export function ReportsView({ inventoryEnabled, creditEnabled }: ReportsViewProps) {
  const [downloading, setDownloading] = useState<ReportType | null>(null);
  const [, startTransition] = useTransition();

  function handleDownload(type: ReportType) {
    setDownloading(type);
    startTransition(async () => {
      const result = await generateReportCSV(type);
      setDownloading(null);

      if (result.error) {
        toast.error("Report failed", result.error);
        return;
      }

      if (!result.csv || !result.filename) return;

      // Trigger browser download
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Report downloaded", result.filename);
    });
  }

  const available = REPORTS.filter((r) => {
    if (r.requiresInventory && !inventoryEnabled) return false;
    if (r.requiresCredit && !creditEnabled) return false;
    return true;
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {available.map((report) => (
        <Card key={report.type} className="flex flex-col">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <report.icon className="size-5" />
              </div>
              {report.badge && <Badge variant="secondary">{report.badge}</Badge>}
            </div>
            <CardTitle className="mt-3 text-base">{report.title}</CardTitle>
            <CardDescription>{report.description}</CardDescription>
          </CardHeader>
          <CardContent className="mt-auto pt-0">
            <Button
              variant="outline"
              className="w-full"
              disabled={downloading === report.type}
              onClick={() => handleDownload(report.type)}
            >
              {downloading === report.type ? (
                "Generating…"
              ) : (
                <>
                  <Download className="size-4" /> Download CSV
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}

      {available.length === 0 && (
        <div className="col-span-2 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <FileBarChart className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-medium">No reports available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enable inventory or credit tracking in Settings to unlock reports.
          </p>
        </div>
      )}
    </div>
  );
}
