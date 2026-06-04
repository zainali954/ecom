import { requireAdmin } from "@/lib/admin-guard";
import { getAdminInventory } from "@/features/admin/queries/inventory";
import { InventoryTable } from "@/features/admin/components/inventory/inventory-table";
import { InventoryFilters } from "@/features/admin/components/inventory/inventory-filters";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    stockLevel?: string;
    productType?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const data = await getAdminInventory(page, params.search, params.stockLevel, params.productType);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track stock levels and manage SKUs</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StockSummaryCard
          label="Out of Stock"
          count={data.items.filter((i) => i.stock === 0).length}
          variant="destructive"
        />
        <StockSummaryCard
          label="Low Stock"
          count={data.items.filter((i) => i.stock > 0 && i.stock <= i.lowStockThreshold).length}
          variant="warning"
        />
        <StockSummaryCard
          label="Adequate"
          count={data.items.filter((i) => i.stock > i.lowStockThreshold).length}
          variant="default"
        />
      </div>

      <InventoryFilters />
      <InventoryTable data={data} />
    </div>
  );
}

function StockSummaryCard({
  label,
  count,
  variant,
}: {
  label: string;
  count: number;
  variant: "destructive" | "warning" | "default";
}) {
  const colorMap = {
    destructive: "border-red-200 dark:border-red-900/50",
    warning: "border-amber-200 dark:border-amber-900/50",
    default: "border-border",
  };

  const textMap = {
    destructive: "text-red-600 dark:text-red-400",
    warning: "text-amber-600 dark:text-amber-400",
    default: "text-foreground",
  };

  return (
    <div className={`rounded-lg border bg-card p-4 ${colorMap[variant]}`}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${textMap[variant]}`}>{count}</p>
    </div>
  );
}
