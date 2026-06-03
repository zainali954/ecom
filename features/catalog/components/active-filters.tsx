"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { FilterCategory } from "@/types/catalog";

interface ActiveFiltersProps {
  categories?: FilterCategory[];
}

export function ActiveFilters({ categories }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const filters: { label: string; param: string }[] = [];

  if (q) {
    filters.push({ label: `Search: "${q}"`, param: "q" });
  }
  if (category) {
    const catName = categories?.find((c) => c.slug === category)?.name ?? category;
    filters.push({ label: `Category: ${catName}`, param: "category" });
  }
  if (minPrice || maxPrice) {
    const label =
      minPrice && maxPrice
        ? `Price: Rs.${minPrice} – Rs.${maxPrice}`
        : minPrice
          ? `Price: Rs.${minPrice}+`
          : `Price: up to Rs.${maxPrice}`;
    filters.push({ label, param: "price" });
  }

  if (filters.length === 0) return null;

  function removeFilter(param: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (param === "price") {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.delete(param);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Badge key={filter.param} variant="secondary" className="gap-1 text-xs font-normal">
          {filter.label}
          <button
            onClick={() => removeFilter(filter.param)}
            className="ml-0.5 hover:text-foreground"
            aria-label={`Remove ${filter.label} filter`}
          >
            <XIcon />
          </button>
        </Badge>
      ))}
    </div>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
