import { requireAdmin } from "@/lib/admin-guard";
import { getAdminProducts } from "@/features/admin/queries/products";
import { getCategoryOptions } from "@/features/admin/queries/categories";
import { ProductTable } from "@/features/admin/components/products/product-table";
import { ProductFilters } from "@/features/admin/components/products/product-filters";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    category?: string;
    type?: string;
    status?: string;
  }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const [data, categories] = await Promise.all([
    getAdminProducts(page, params.search, params.category, params.type, params.status),
    getCategoryOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your product catalog</p>
      </div>

      <ProductFilters categories={categories} />
      <ProductTable data={data} />
    </div>
  );
}
