"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Trash2, Users, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { CustomerFormDialog } from "./customer-form-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { EmptyState } from "./empty-state";
import { deleteCustomer } from "@/lib/actions/customers";
import { toast } from "@/lib/toast";
import type { CustomerWithBalance } from "@/lib/types/database";

interface CustomersTableProps {
  customers: CustomerWithBalance[];
  storeId: string;
}

export function CustomersTable({ customers, storeId }: CustomersTableProps) {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<CustomerWithBalance | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerWithBalance | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.phone ?? "").includes(q)
    );
  }, [customers, search]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteCustomer(storeId, deleteTarget.id, deleteTarget.name);
    if (result?.error) toast.error("Delete failed", result.error);
    else toast.success("Customer deleted");
  }

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by name or phone…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="accent" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Add customer
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search ? "No customers match" : "No customers yet"}
          description={search ? "Try a different name or phone number." : "Add your first customer to start tracking credit and transactions."}
          action={!search ? <Button variant="accent" onClick={() => setAddOpen(true)}><Plus className="size-4" /> Add customer</Button> : undefined}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/customers/${c.id}`} className="font-medium hover:text-accent hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="size-3" />
                        {c.phone}
                      </span>
                    ) : "—"}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {c.outstanding_balance > 0 ? (
                      <span className="text-destructive">₹{c.outstanding_balance.toFixed(2)}</span>
                    ) : (
                      <span className="text-success">Settled</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {c.outstanding_balance > 0 ? (
                      <Badge variant="warning">Has balance</Badge>
                    ) : (
                      <Badge variant="success">Clear</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="size-8" asChild>
                        <Link href={`/customers/${c.id}`}><ArrowRight className="size-3.5" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditCustomer(c)}>
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(c)}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CustomerFormDialog storeId={storeId} open={addOpen} onOpenChange={setAddOpen} />
      <CustomerFormDialog storeId={storeId} open={!!editCustomer} onOpenChange={(o) => !o && setEditCustomer(null)} customer={editCustomer} />
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete customer?"
        description={`"${deleteTarget?.name}" and all their ledger entries will be permanently deleted.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
