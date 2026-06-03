"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { FilterCategory } from "@/types/catalog";

interface FilterSidebarProps {
  categories?: FilterCategory[];
  priceRange: { min: number; max: number };
  showCategoryFilter: boolean;
}

export function FilterSidebar({ categories, priceRange, showCategoryFilter }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

  function handleCategoryChange(slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (currentCategory === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePriceApply() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }
    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleClearAll() {
    router.push(pathname);
  }

  const hasActiveFilters = currentCategory || currentMinPrice || currentMaxPrice;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-xs text-muted-foreground hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {showCategoryFilter && categories && categories.length > 0 && (
        <>
          <div className="space-y-3">
            <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Category
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.slug} className="flex cursor-pointer items-center gap-2 text-sm">
                  <Checkbox
                    checked={currentCategory === cat.slug}
                    onCheckedChange={() => handleCategoryChange(cat.slug)}
                  />
                  <span className="flex-1">{cat.name}</span>
                  <span className="text-xs text-muted-foreground">{cat.productCount}</span>
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      <div className="space-y-3">
        <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Price Range
        </h4>
        <p className="text-xs text-muted-foreground">
          Rs. {priceRange.min.toLocaleString()} — Rs. {priceRange.max.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="minPrice" className="text-xs">
              Min
            </Label>
            <Input
              id="minPrice"
              type="number"
              placeholder={String(priceRange.min)}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="h-8 text-xs"
              min={0}
            />
          </div>
          <span className="mt-5 text-xs text-muted-foreground">—</span>
          <div className="flex-1 space-y-1">
            <Label htmlFor="maxPrice" className="text-xs">
              Max
            </Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder={String(priceRange.max)}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="h-8 text-xs"
              min={0}
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full text-xs"
          onClick={handlePriceApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}
