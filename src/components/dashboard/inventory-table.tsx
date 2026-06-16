"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Pencil, Trash2, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { ProductFormDialog } from "./product-form-dialog";
import { ConfirmDeleteDialog } from "./confirm-delete-dialog";
import { EmptyState } from "./empty-state";
import { deleteProduct } from "@/lib/actions/products";
import { toast } from "@/lib/toast";
import type { ProductRow } from "@/lib/types/database";

interface InventoryTableProps {
  products: ProductRow[];
  storeId: string;
  expiryEnabled: boolean;
}

export function InventoryTable({ products, storeId, expiryEnabled }: InventoryTableProps) {
  const [search, setSearch] = useState("");
  const [filterLow, setFilterLow] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q)
      );
    }
    if (filterLow) {
      list = list.filter((p) => p.quantity <= p.low_stock_threshold);
    }
    return list;
  }, [products, search, filterLow]);

  const lowCount = products.filter((p) => p.quantity <= p.low_stock_threshold).length;

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteProduct(storeId, deleteTarget.id, deleteTarget.name);
    if (result?.error) {
      toast.error("Delete failed", result.error);
    } else {
      toast.success("Product deleted");
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {lowCount > 0 && (
            <Button
              variant={filterLow ? "accent" : "outline"}
              size="sm"
              onClick={() => setFilterLow(!filterLow)}
            >
              <AlertTriangle className="size-4" />
              Low stock ({lowCount})
            </Button>
          )}
        </div>
        <Button variant="accent" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" /> Add product
        </Button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={search || filterLow ? "No products match" : "No products yet"}
          description={
            search || filterLow
              ? "Try a different search or clear filters."
              : "Add your first product to start tracking inventory."
          }
          action={
            !search && !filterLow ? (
              <Button variant="accent" onClick={() => setAddOpen(true)}>
                <Plus className="size-4" /> Add product
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                {expiryEnabled && <TableHead>Expiry</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const isLow = product.quantity <= product.low_stock_threshold;
                const isExpiringSoon =
                  expiryEnabled &&
                  product.expiry_date &&
                  new Date(product.expiry_date) <
                    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

                return (
                  <TableRow key={product.id} className={isLow ? "bg-destructive/5" : undefined}>
                    <TableCell>
                      <p className="font-medium">{product.name}</p>
                      {product.unit && (
                        <p className="text-xs text-muted-foreground">per {product.unit}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.category ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {product.quantity}
                      <span className="ml-1 text-xs text-muted-foreground">
                        / {product.low_stock_threshold}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {product.price !== null ? `₹${product.price}` : "—"}
                    </TableCell>
                    {expiryEnabled && (
                      <TableCell className="text-muted-foreground">
                        {product.expiry_date ? (
                          <span className={isExpiringSoon ? "text-destructive font-medium" : ""}>
                            {new Date(product.expiry_date).toLocaleDateString("en-IN")}
                          </span>
                        ) : "—"}
                      </TableCell>
                    )}
                    <TableCell>
                      {isLow ? (
                        <Badge variant="warning">Low stock</Badge>
                      ) : (
                        <Badge variant="success">In stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => setEditProduct(product)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(product)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductFormDialog
        storeId={storeId}
        expiryEnabled={expiryEnabled}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      <ProductFormDialog
        storeId={storeId}
        expiryEnabled={expiryEnabled}
        open={!!editProduct}
        onOpenChange={(o) => !o && setEditProduct(null)}
        product={editProduct}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete product?"
        description={`"${deleteTarget?.name}" will be permanently removed from your inventory.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
