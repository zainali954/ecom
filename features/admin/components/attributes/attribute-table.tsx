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
import type { AdminAttributesPageData } from "@/types/admin";
import { AttributeActions } from "./attribute-actions";

interface AttributeTableProps {
  data: AdminAttributesPageData;
}

export function AttributeTable({ data }: AttributeTableProps) {
  if (data.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16 text-center">
        <p className="text-sm text-muted-foreground">No attributes found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Values</TableHead>
              <TableHead>Affects</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.attributes.map((attr) => (
              <TableRow key={attr.id}>
                <TableCell>
                  <Link
                    href={`/admin/attributes/${attr.id}`}
                    className="font-medium hover:underline"
                  >
                    {attr.name}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {attr.slug}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {attr.values.slice(0, 5).map((v) => (
                      <Badge key={v.id} variant="secondary" className="text-[11px]">
                        {v.value}
                      </Badge>
                    ))}
                    {attr.values.length > 5 && (
                      <Badge variant="outline" className="text-[11px]">
                        +{attr.values.length - 5}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    {attr.affectsPrice && (
                      <Badge variant="outline" className="text-[10px]">
                        Price
                      </Badge>
                    )}
                    {attr.affectsStock && (
                      <Badge variant="outline" className="text-[10px]">
                        Stock
                      </Badge>
                    )}
                    {attr.affectsSku && (
                      <Badge variant="outline" className="text-[10px]">
                        SKU
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <AttributeActions attribute={attr} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {data.attributes.length} of {data.total} attributes · Page {data.page} of{" "}
            {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={data.page <= 1} asChild>
              <Link href={`/admin/attributes?page=${data.page - 1}`} aria-disabled={data.page <= 1}>
                Previous
              </Link>
            </Button>
            <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} asChild>
              <Link
                href={`/admin/attributes?page=${data.page + 1}`}
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
