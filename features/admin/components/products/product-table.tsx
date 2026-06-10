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
import type { AdminProductsPageData } from "@/types/admin";
import { ProductActions } from "./product-actions";

interface ProductTableProps {
  data: AdminProductsPageData;
}

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString("en-PK")}`;
}

export function ProductTable({ data }: ProductTableProps) {
  if (data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">No products found.</p>
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
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.images[0] ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        className="h-10 w-10 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                        <ImagePlaceholder />
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="font-mono text-xs text-muted-foreground">
                        {product.sku || "—"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {product.category.name || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{product.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {product.salePrice ? (
                      <>
                        <span className="font-medium">{formatPrice(product.salePrice)}</span>
                        <span className="ml-1 text-xs text-muted-foreground line-through">
                          {formatPrice(product.basePrice)}
                        </span>
                      </>
                    ) : (
                      <span className="font-medium">{formatPrice(product.basePrice)}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {product.type === "variable" ? (
                    <span className="text-muted-foreground">
                      {product.variantCount} variant{product.variantCount !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span className={product.stock <= 0 ? "text-destructive" : ""}>
                      {product.stock}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={product.isActive ? "outline" : "destructive"}>
                      {product.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {product.isFeatured && <Badge variant="default">Featured</Badge>}
                  </div>
                </TableCell>
                <TableCell>
                  <ProductActions product={product} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {data.products.length} of {data.total} products · Page {data.page} of{" "}
            {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={data.page <= 1} asChild>
              <Link href={`/admin/products?page=${data.page - 1}`} aria-disabled={data.page <= 1}>
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} asChild>
              <Link
                href={`/admin/products?page=${data.page + 1}`}
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

function ImagePlaceholder() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}
