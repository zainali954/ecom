"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { AttributeOption } from "@/types/admin";

export interface VariantRow {
  id?: string;
  attributes: { attribute: string; value: string }[];
  price: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  isActive: boolean;
}

interface SelectedAttribute {
  attributeId: string;
  valueIds: string[];
}

interface ProductVariantManagerProps {
  attributeOptions: AttributeOption[];
  selectedAttributes: SelectedAttribute[];
  onSelectedAttributesChange: (attrs: SelectedAttribute[]) => void;
  variants: VariantRow[];
  onVariantsChange: (variants: VariantRow[]) => void;
}

export function ProductVariantManager({
  attributeOptions,
  selectedAttributes,
  onSelectedAttributesChange,
  variants,
  onVariantsChange,
}: ProductVariantManagerProps) {
  function addAttribute(attrId: string) {
    if (selectedAttributes.some((sa) => sa.attributeId === attrId)) return;
    onSelectedAttributesChange([...selectedAttributes, { attributeId: attrId, valueIds: [] }]);
  }

  function removeAttribute(attrId: string) {
    onSelectedAttributesChange(selectedAttributes.filter((sa) => sa.attributeId !== attrId));
  }

  function toggleAttributeValue(attrId: string, valueId: string) {
    onSelectedAttributesChange(
      selectedAttributes.map((sa) => {
        if (sa.attributeId !== attrId) return sa;
        const has = sa.valueIds.includes(valueId);
        return {
          ...sa,
          valueIds: has ? sa.valueIds.filter((v) => v !== valueId) : [...sa.valueIds, valueId],
        };
      }),
    );
  }

  function generateVariants() {
    const attrSets = selectedAttributes
      .filter((sa) => sa.valueIds.length > 0)
      .map((sa) => sa.valueIds.map((vid) => ({ attribute: sa.attributeId, value: vid })));

    if (attrSets.length === 0) return;

    function cartesian(
      sets: { attribute: string; value: string }[][],
    ): { attribute: string; value: string }[][] {
      if (sets.length === 0) return [[]];
      const [first, ...rest] = sets;
      const restCombinations = cartesian(rest);
      return first.flatMap((item) => restCombinations.map((combo) => [item, ...combo]));
    }

    const combos = cartesian(attrSets);

    const newVariants: VariantRow[] = combos.map((attrs) => {
      const existing = variants.find(
        (v) =>
          v.attributes.length === attrs.length &&
          attrs.every((a) =>
            v.attributes.some((va) => va.attribute === a.attribute && va.value === a.value),
          ),
      );
      if (existing) return existing;
      return {
        attributes: attrs,
        price: 0,
        salePrice: null,
        sku: "",
        stock: 0,
        isActive: true,
      };
    });

    onVariantsChange(newVariants);
  }

  function updateVariant(index: number, field: keyof VariantRow, value: unknown) {
    onVariantsChange(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function removeVariant(index: number) {
    onVariantsChange(variants.filter((_, i) => i !== index));
  }

  function getAttrName(attrId: string) {
    return attributeOptions.find((a) => a.id === attrId)?.name ?? attrId;
  }

  function getValueLabel(attrId: string, valueId: string) {
    const attr = attributeOptions.find((a) => a.id === attrId);
    return attr?.values.find((v) => v.id === valueId)?.value ?? valueId;
  }

  const unusedAttrs = attributeOptions.filter(
    (a) => !selectedAttributes.some((sa) => sa.attributeId === a.id),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Attributes & Variants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Attributes</Label>
          {unusedAttrs.length > 0 && (
            <Select onValueChange={addAttribute}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Add attribute..." />
              </SelectTrigger>
              <SelectContent>
                {unusedAttrs.map((attr) => (
                  <SelectItem key={attr.id} value={attr.id}>
                    {attr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedAttributes.map((sa) => {
            const attr = attributeOptions.find((a) => a.id === sa.attributeId);
            if (!attr) return null;
            return (
              <div key={sa.attributeId} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{attr.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive hover:text-destructive"
                    onClick={() => removeAttribute(sa.attributeId)}
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((val) => (
                    <label
                      key={val.id}
                      className="flex items-center gap-1.5 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={sa.valueIds.includes(val.id)}
                        onCheckedChange={() => toggleAttributeValue(sa.attributeId, val.id)}
                      />
                      {val.value}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {selectedAttributes.some((sa) => sa.valueIds.length > 0) && (
          <Button type="button" variant="outline" onClick={generateVariants}>
            Generate Variants
          </Button>
        )}

        {variants.length > 0 && (
          <div className="space-y-3">
            <Label>Variants ({variants.length})</Label>
            <div className="space-y-2">
              {variants.map((variant, index) => (
                <div key={index} className="rounded-lg border p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {variant.attributes.map((a, ai) => (
                        <Badge key={ai} variant="secondary">
                          {getAttrName(a.attribute)}: {getValueLabel(a.attribute, a.value)}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => removeVariant(index)}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Price</Label>
                      <Input
                        type="number"
                        min={0}
                        value={variant.price}
                        onChange={(e) => updateVariant(index, "price", Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sale Price</Label>
                      <Input
                        type="number"
                        min={0}
                        value={variant.salePrice ?? ""}
                        onChange={(e) =>
                          updateVariant(
                            index,
                            "salePrice",
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SKU</Label>
                      <Input
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, "sku", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Stock</Label>
                      <Input
                        type="number"
                        min={0}
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, "stock", Number(e.target.value))}
                        className="h-8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAttributes.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-2">
            Add attributes above to create product variants.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
