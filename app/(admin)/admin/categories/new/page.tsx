import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { getCategoryOptions } from "@/features/admin/queries/categories";
import { CategoryForm } from "@/features/admin/components/categories/category-form";
import { Button } from "@/components/ui/button";

export default async function AdminNewCategoryPage() {
  await requireAdmin();
  const parentOptions = await getCategoryOptions();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/categories">← Back to Categories</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create a new product category</p>
      </div>

      <CategoryForm parentOptions={parentOptions} />
    </div>
  );
}
