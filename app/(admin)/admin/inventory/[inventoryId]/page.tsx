import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getAdminInventoryById } from "@/features/admin/queries/inventory";
import { InventoryForm } from "@/features/admin/components/inventory/inventory-form";
import { Button } from "@/components/ui/button";

export default async function AdminEditInventoryPage({
  params,
}: {
  params: Promise<{ inventoryId: string }>;
}) {
  await requireAdmin();
  const { inventoryId } = await params;

  const item = await getAdminInventoryById(inventoryId);

  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/inventory">← Back to Inventory</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update stock for {item.product.name}
          {item.variant ? ` (${item.variant.attributes.map((a) => a.value).join(", ")})` : ""}
        </p>
      </div>

      <InventoryForm item={item} />
    </div>
  );
}
