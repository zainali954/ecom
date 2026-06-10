"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminInventoryPageData } from "@/types/admin";
import { InventoryActions } from "./inventory-actions";

interface InventoryTableProps {
  data: AdminInventoryPageData;
}

function getStockBadge(stock: number, threshold: number) {
  if (stock === 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  if (stock <= threshold) {
    return (
      <Badge
        variant="secondary"
        className="border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
      >
        Low Stock
      </Badge>
    );
  }
  return <Badge variant="outline">In Stock</Badge>;
}

function formatVariantLabel(attributes: { attributeName: string; value: string }[]) {
  return attributes.map((a) => `${a.attributeName}: ${a.value}`).join(", ");
}

export function InventoryTable({ data }: InventoryTableProps) {
  if (data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">No inventory records found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Variant</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Threshold</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/admin/inventory/${item.id}`}
                    className="font-medium hover:underline"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    <Badge variant="secondary" className="mr-1 text-[10px] px-1 py-0">
                      {item.product.type}
                    </Badge>
                  </p>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.variant ? formatVariantLabel(item.variant.attributes) : "—"}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs">{item.sku || "—"}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      item.stock === 0
                        ? "font-semibold text-destructive"
                        : item.stock <= item.lowStockThreshold
                          ? "font-semibold text-amber-600 dark:text-amber-400"
                          : "font-medium"
                    }
                  >
                    {item.stock}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.lowStockThreshold}
                </TableCell>
                <TableCell>{getStockBadge(item.stock, item.lowStockThreshold)}</TableCell>
                <TableCell>
                  <InventoryActions item={item} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {data.items.length} of {data.total} records · Page {data.page} of{" "}
            {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={data.page <= 1} asChild>
              <Link href={`/admin/inventory?page=${data.page - 1}`} aria-disabled={data.page <= 1}>
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} asChild>
              <Link
                href={`/admin/inventory?page=${data.page + 1}`}
                aria-disabled={data.page >= data.totalPages}
              >
                Next
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
