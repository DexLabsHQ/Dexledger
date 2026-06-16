"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createLedgerEntry } from "@/lib/actions/customers";
import { toast } from "@/lib/toast";
import type { CustomerRow, LedgerEntryType } from "@/lib/types/database";

interface LedgerEntryDialogProps {
  storeId: string;
  customers: CustomerRow[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: LedgerEntryType;
  defaultCustomerId?: string;
}

export function LedgerEntryDialog({
  storeId,
  customers,
  open,
  onOpenChange,
  defaultType = "purchase",
  defaultCustomerId,
}: LedgerEntryDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [customerId, setCustomerId] = useState(defaultCustomerId ?? "");
  const [type, setType] = useState<LedgerEntryType>(defaultType);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCustomerId(defaultCustomerId ?? "");
      setType(defaultType);
      setAmount("");
      setDescription("");
      setError(null);
    }
  }, [open, defaultCustomerId, defaultType]);

  function handleSubmit() {
    if (!customerId) { setError("Please select a customer."); return; }
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setError("Amount must be greater than zero."); return; }
    setError(null);

    const customer = customers.find((c) => c.id === customerId);
    startTransition(async () => {
      const result = await createLedgerEntry(storeId, {
        customerId,
        customerName: customer?.name ?? "",
        type,
        amount: amt,
        description,
      });
      if (result?.error) { setError(result.error); return; }
      toast.success(
        type === "purchase" ? "Purchase recorded" : "Payment recorded",
        `₹${amt.toFixed(2)} for ${customer?.name}`
      );
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record transaction</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Customer *</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Transaction type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as LedgerEntryType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchase">Purchase (add to balance)</SelectItem>
                <SelectItem value="payment">Payment (reduce balance)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="l-amount">Amount (₹) *</Label>
            <Input
              id="l-amount"
              type="number"
              min={0.01}
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="l-desc">Description</Label>
            <Textarea
              id="l-desc"
              placeholder={type === "purchase" ? "e.g. Household goods" : "e.g. Cash payment received"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="accent" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : type === "purchase" ? "Record purchase" : "Record payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
