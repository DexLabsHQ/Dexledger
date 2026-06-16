"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
import { toast } from "@/lib/toast";
import type { CustomerRow } from "@/lib/types/database";

interface CustomerFormDialogProps {
  storeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerRow | null;
}

const EMPTY = { name: "", phone: "", notes: "" };

export function CustomerFormDialog({ storeId, open, onOpenChange, customer }: CustomerFormDialogProps) {
  const isEdit = !!customer;
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFields({ name: customer.name, phone: customer.phone ?? "", notes: customer.notes ?? "" });
    } else {
      setFields(EMPTY);
    }
    setError(null);
  }, [customer, open]);

  function set(key: keyof typeof EMPTY, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!fields.name.trim()) { setError("Customer name is required."); return; }
    setError(null);
    startTransition(async () => {
      const result = isEdit && customer
        ? await updateCustomer(storeId, customer.id, fields)
        : await createCustomer(storeId, fields);
      if (result?.error) { setError(result.error); return; }
      toast.success(isEdit ? "Customer updated" : "Customer added");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit customer" : "Add customer"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="c-name">Full name *</Label>
            <Input id="c-name" value={fields.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ramesh Kumar" autoFocus />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="c-phone">Phone number</Label>
            <Input id="c-phone" type="tel" value={fields.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="c-notes">Notes</Label>
            <Textarea id="c-notes" value={fields.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any notes about this customer…" rows={3} />
          </div>
          {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="accent" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Add customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
