"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Banknote, ArrowRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { LedgerEntryDialog } from "./ledger-entry-dialog";
import { EmptyState } from "./empty-state";
import type { CustomerWithBalance, CustomerRow } from "@/lib/types/database";

interface CreditLedgerViewProps {
  customers: CustomerWithBalance[];
  storeId: string;
}

export function CreditLedgerView({ customers, storeId }: CreditLedgerViewProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"purchase" | "payment">("purchase");

  const withBalance = customers.filter((c) => c.outstanding_balance > 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding_balance, 0);

  const baseCustomers: CustomerRow[] = customers.map((c) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { outstanding_balance, total_purchases, total_payments, last_activity_at, ...base } = c;
    return base;
  });

  function openDialog(type: "purchase" | "payment") {
    setDialogType(type);
    setDialogOpen(true);
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Total outstanding credit</p>
          <p className="text-3xl font-semibold tracking-tight text-destructive">
            ₹{totalOutstanding.toFixed(2)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => openDialog("payment")}>
            <Banknote className="size-4" /> Record payment
          </Button>
          <Button variant="accent" onClick={() => openDialog("purchase")}>
            <ShoppingCart className="size-4" /> Record purchase
          </Button>
        </div>
      </div>

      {/* Outstanding balances table */}
      {customers.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No customers yet"
          description="Add customers first, then record their purchases and payments here."
          action={
            <Button variant="accent" asChild>
              <Link href="/customers"><Plus className="size-4" /> Add customers</Link>
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border px-6 py-4">
            <h2 className="font-semibold">Outstanding Balances</h2>
            <p className="text-sm text-muted-foreground">
              {withBalance.length} customer{withBalance.length !== 1 ? "s" : ""} with outstanding credit
            </p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Purchases</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/customers/${c.id}`} className="font-medium hover:text-accent hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{c.total_purchases.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{c.total_payments.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {c.outstanding_balance > 0 ? (
                      <span className="text-destructive">₹{c.outstanding_balance.toFixed(2)}</span>
                    ) : (
                      <span className="text-success">₹0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.outstanding_balance > 0 ? (
                      <Badge variant="warning">Owes</Badge>
                    ) : (
                      <Badge variant="success">Settled</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="size-8" asChild>
                      <Link href={`/customers/${c.id}`}><ArrowRight className="size-3.5" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LedgerEntryDialog
        storeId={storeId}
        customers={baseCustomers}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultType={dialogType}
      />
    </div>
  );
}
