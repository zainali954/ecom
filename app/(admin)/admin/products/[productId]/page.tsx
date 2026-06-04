import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";
import { getCategoryOptions } from "@/features/admin/queries/categories";
import { getAdminProductById, getAttributeOptions } from "@/features/admin/queries/products";
import { ProductForm } from "@/features/admin/components/products/product-form";
import { Button } from "@/components/ui/button";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  await requireAdmin();
  const { productId } = await params;

  const [product, categories, attributeOptions] = await Promise.all([
    getAdminProductById(productId),
    getCategoryOptions(),
    getAttributeOptions(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/products">← Back to Products</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update {product.name}</p>
      </div>

      <ProductForm product={product} categories={categories} attributeOptions={attributeOptions} />
    </div>
  );
}
