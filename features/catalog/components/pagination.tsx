"use client";

import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/catalog";

interface PaginationProps {
  pagination: PaginationMeta;
}

export function Pagination({ pagination }: PaginationProps) {
  const { currentPage, totalPages } = pagination;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 pt-8" aria-label="Pagination">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        asChild
        disabled={currentPage <= 1}
      >
        <Link href={buildHref(currentPage - 1)} aria-label="Previous page">
          Previous
        </Link>
      </Button>

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? "default" : "outline"}
            size="sm"
            className={cn("h-8 w-8 text-xs", page === currentPage && "pointer-events-none")}
            asChild
          >
            <Link href={buildHref(page as number)}>{page}</Link>
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs"
        asChild
        disabled={currentPage >= totalPages}
      >
        <Link href={buildHref(currentPage + 1)} aria-label="Next page">
          Next
        </Link>
      </Button>
    </nav>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
