"use client";

import { SortSelect } from "./sort-select";
import { MobileFilterSheet } from "./mobile-filter-sheet";
import type { PaginationMeta, FilterCategory } from "@/types/catalog";

interface CatalogToolbarProps {
  pagination: PaginationMeta;
  categories?: FilterCategory[];
  priceRange: { min: number; max: number };
  showCategoryFilter: boolean;
}

export function CatalogToolbar({
  pagination,
  categories,
  priceRange,
  showCategoryFilter,
}: CatalogToolbarProps) {
  const start = (pagination.currentPage - 1) * pagination.limit + 1;
  const end = Math.min(pagination.currentPage * pagination.limit, pagination.totalItems);

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <MobileFilterSheet
          categories={categories}
          priceRange={priceRange}
          showCategoryFilter={showCategoryFilter}
        />
        <p className="text-xs text-muted-foreground">
          {pagination.totalItems === 0
            ? "No products found"
            : `Showing ${start}–${end} of ${pagination.totalItems}`}
        </p>
      </div>
      <SortSelect />
    </div>
  );
}
