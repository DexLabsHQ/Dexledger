"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { toast } from "@/lib/toast";
import type { ProductRow } from "@/lib/types/database";

interface ProductFormDialogProps {
  storeId: string;
  expiryEnabled: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductRow | null;
}

const EMPTY = {
  name: "",
  category: "",
  quantity: 0,
  lowStockThreshold: 0,
  expiryDate: "",
  unit: "",
  price: "",
};

export function ProductFormDialog({
  storeId,
  expiryEnabled,
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const isEdit = !!product;
  const [isPending, startTransition] = useTransition();
  const [fields, setFields] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFields({
        name: product.name,
        category: product.category ?? "",
        quantity: product.quantity,
        lowStockThreshold: product.low_stock_threshold,
        expiryDate: product.expiry_date ?? "",
        unit: product.unit ?? "",
        price: product.price !== null ? String(product.price) : "",
      });
    } else {
      setFields(EMPTY);
    }
    setError(null);
  }, [product, open]);

  function set(key: keyof typeof EMPTY, value: string | number) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!fields.name.trim()) {
      setError("Product name is required.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const payload = {
        name: fields.name,
        category: fields.category,
        quantity: Number(fields.quantity),
        lowStockThreshold: Number(fields.lowStockThreshold),
        expiryDate: fields.expiryDate || null,
        unit: fields.unit,
        price: fields.price !== "" ? Number(fields.price) : null,
      };

      const result = isEdit && product
        ? await updateProduct(storeId, product.id, payload)
        : await createProduct(storeId, payload);

      if (result?.error) {
        setError(result.error);
        return;
      }

      toast.success(isEdit ? "Product updated" : "Product added");
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="p-name">Product name *</Label>
            <Input
              id="p-name"
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Paracetamol 500mg"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="p-category">Category</Label>
              <Input
                id="p-category"
                value={fields.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Medicine"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-unit">Unit</Label>
              <Input
                id="p-unit"
                value={fields.unit}
                onChange={(e) => set("unit", e.target.value)}
                placeholder="e.g. strips, kg, pcs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="p-qty">Quantity</Label>
              <Input
                id="p-qty"
                type="number"
                min={0}
                value={fields.quantity}
                onChange={(e) => set("quantity", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="p-threshold">Low stock threshold</Label>
              <Input
                id="p-threshold"
                type="number"
                min={0}
                value={fields.lowStockThreshold}
                onChange={(e) => set("lowStockThreshold", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="p-price">Price (₹)</Label>
            <Input
              id="p-price"
              type="number"
              min={0}
              step="0.01"
              value={fields.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="Optional selling price"
            />
          </div>

          {expiryEnabled && (
            <div className="grid gap-1.5">
              <Label htmlFor="p-expiry">Expiry date</Label>
              <Input
                id="p-expiry"
                type="date"
                value={fields.expiryDate}
                onChange={(e) => set("expiryDate", e.target.value)}
              />
            </div>
          )}

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="accent" onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Add product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
