"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { AdminInventoryItem } from "@/types/admin";
import { inventoryUpdateSchema, type InventoryUpdateInput } from "@/schemas/inventory";
import { updateInventory } from "../../actions/inventory";

interface InventoryFormProps {
  item: AdminInventoryItem;
}

export function InventoryForm({ item }: InventoryFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryUpdateInput>({
    resolver: zodResolver(inventoryUpdateSchema),
    defaultValues: {
      stock: item.stock,
      lowStockThreshold: item.lowStockThreshold,
      sku: item.sku,
    },
  });

  function onSubmit(data: InventoryUpdateInput) {
    startTransition(async () => {
      const result = await updateInventory(item.id, data);
      if (result.success) {
        toast.success(result.message);
        router.push("/admin/inventory");
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">Product Information</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.product.name}</span>
            <Badge variant="secondary">{item.product.type}</Badge>
          </div>
          {item.variant && (
            <div className="flex flex-wrap gap-2">
              {item.variant.attributes.map((attr, i) => (
                <Badge key={i} variant="outline">
                  {attr.attributeName}: {attr.value}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Stock Settings</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} placeholder="Enter SKU" />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                {...register("stock", { valueAsNumber: true })}
              />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min={0}
                {...register("lowStockThreshold", { valueAsNumber: true })}
              />
              {errors.lowStockThreshold && (
                <p className="text-xs text-destructive">{errors.lowStockThreshold.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/inventory")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
