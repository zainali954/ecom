import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { getCategoryOptions } from "@/features/admin/queries/categories";
import { getAttributeOptions } from "@/features/admin/queries/products";
import { ProductForm } from "@/features/admin/components/products/product-form";
import { Button } from "@/components/ui/button";

export default async function AdminNewProductPage() {
  await requireAdmin();

  const [categories, attributeOptions] = await Promise.all([
    getCategoryOptions(),
    getAttributeOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">← Back to Products</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Add a new product to your catalog</p>
      </div>

      <ProductForm categories={categories} attributeOptions={attributeOptions} />
    </div>
  );
}
