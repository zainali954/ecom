import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getAdminCategoryById, getCategoryOptions } from "@/features/admin/queries/categories";
import { CategoryForm } from "@/features/admin/components/categories/category-form";
import { Button } from "@/components/ui/button";

export default async function AdminEditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  await requireAdmin();
  const { categoryId } = await params;

  const [category, parentOptions] = await Promise.all([
    getAdminCategoryById(categoryId),
    getCategoryOptions(categoryId),
  ]);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/categories">← Back to Categories</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Category</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update {category.name}</p>
      </div>

      <CategoryForm category={category} parentOptions={parentOptions} />
    </div>
  );
}
