import { requireAdmin } from "@/lib/admin-guard";
import { getAdminCategories } from "@/features/admin/queries/categories";
import { CategoryTable } from "@/features/admin/components/categories/category-table";
import { CategoryFilters } from "@/features/admin/components/categories/category-filters";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; parent?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const data = await getAdminCategories(page, params.search, params.status, params.parent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage product categories</p>
      </div>

      <CategoryFilters />
      <CategoryTable data={data} />
    </div>
  );
}
