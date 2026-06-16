import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ShoppingCart, Banknote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentStore } from "@/lib/actions/store";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import type { LedgerEntryRow, CustomerRow } from "@/lib/types/database";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await getCurrentStore();
  if (!store) redirect("/onboarding");

  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("store_id", store.id)
    .maybeSingle();

  if (!customer) notFound();

  const { data: ledgerEntries } = await supabase
    .from("ledger_entries")
    .select("*")
    .eq("customer_id", id)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  const { data: balanceRow } = await supabase
    .from("customer_balances")
    .select("*")
    .eq("customer_id", id)
    .maybeSingle();

  const totalPurchases = Number(balanceRow?.total_purchases ?? 0);
  const totalPayments = Number(balanceRow?.total_payments ?? 0);
  const outstanding = Number(balanceRow?.outstanding_balance ?? 0);

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-4">
          <Link href="/customers">
            <ArrowLeft className="size-4" /> Back to customers
          </Link>
        </Button>
        <PageHeader
          title={(customer as CustomerRow).name}
          description={(customer as CustomerRow).phone ?? "No phone number"}
        />
      </div>

      {/* Customer summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-semibold ${outstanding > 0 ? "text-destructive" : "text-success"}`}>
              ₹{outstanding.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">₹{totalPurchases.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-success">₹{totalPayments.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Customer info */}
      {(customer as CustomerRow).notes && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-start gap-2">
            <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-sm">{(customer as CustomerRow).notes}</p>
          </div>
        </div>
      )}

      {/* Ledger history */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <h2 className="font-semibold">Transaction History</h2>
          <Badge variant="secondary" className="ml-auto">{ledgerEntries?.length ?? 0} entries</Badge>
        </div>

        {!ledgerEntries || ledgerEntries.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No transactions recorded yet. Head to{" "}
            <Link href="/credit" className="text-accent hover:underline">Credit / Udhaar</Link>{" "}
            to add one.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(ledgerEntries as LedgerEntryRow[]).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted-foreground">{formatDate(entry.created_at)}</TableCell>
                  <TableCell>
                    {entry.type === "purchase" ? (
                      <Badge variant="warning" className="gap-1">
                        <ShoppingCart className="size-3" /> Purchase
                      </Badge>
                    ) : (
                      <Badge variant="success" className="gap-1">
                        <Banknote className="size-3" /> Payment
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={entry.type === "purchase" ? "text-destructive" : "text-success"}>
                      {entry.type === "purchase" ? "-" : "+"}₹{Number(entry.amount).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
