"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProductAttributeDetail, ProductVariantDetail } from "@/types/product";

interface VariantSelectorProps {
  attributes: ProductAttributeDetail[];
  variants: ProductVariantDetail[];
  onVariantChange: (variant: ProductVariantDetail | null) => void;
}

export function VariantSelector({ attributes, variants, onVariantChange }: VariantSelectorProps) {
  const [selected, setSelected] = useState<Record<string, string>>({});

  const selectedVariant = useMemo(() => {
    if (Object.keys(selected).length !== attributes.length) return null;

    return (
      variants.find((v) => v.attributes.every((a) => selected[a.attributeSlug] === a.valueSlug)) ??
      null
    );
  }, [selected, attributes.length, variants]);

  function handleSelect(attributeSlug: string, valueSlug: string) {
    const next = { ...selected };
    if (next[attributeSlug] === valueSlug) {
      delete next[attributeSlug];
    } else {
      next[attributeSlug] = valueSlug;
    }
    setSelected(next);

    if (Object.keys(next).length === attributes.length) {
      const match =
        variants.find((v) => v.attributes.every((a) => next[a.attributeSlug] === a.valueSlug)) ??
        null;
      onVariantChange(match);
    } else {
      onVariantChange(null);
    }
  }

  function isValueAvailable(attributeSlug: string, valueSlug: string): boolean {
    const otherSelections = Object.entries(selected).filter(([key]) => key !== attributeSlug);

    if (otherSelections.length === 0) return true;

    return variants.some(
      (v) =>
        v.isActive &&
        v.attributes.some((a) => a.attributeSlug === attributeSlug && a.valueSlug === valueSlug) &&
        otherSelections.every(([attrSlug, valSlug]) =>
          v.attributes.some((a) => a.attributeSlug === attrSlug && a.valueSlug === valSlug),
        ),
    );
  }

  return (
    <div className="space-y-5">
      {attributes.map((attr) => (
        <div key={attr.id} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{attr.name}</span>
            {attr.affectsPrice && (
              <Badge variant="secondary" className="text-[10px]">
                Affects price
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {attr.values.map((val) => {
              const isSelected = selected[attr.slug] === val.slug;
              const available = isValueAvailable(attr.slug, val.slug);

              return (
                <button
                  key={val.id}
                  onClick={() => handleSelect(attr.slug, val.slug)}
                  disabled={!available}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : available
                        ? "border-border hover:border-foreground"
                        : "cursor-not-allowed border-border/50 text-muted-foreground/50 line-through",
                  )}
                >
                  {val.value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedVariant && selectedVariant.sku && (
        <p className="text-xs text-muted-foreground">SKU: {selectedVariant.sku}</p>
      )}
    </div>
  );
}
