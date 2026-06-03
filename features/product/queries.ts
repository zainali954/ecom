import { connectDB } from "@/lib/db";
import { Product } from "@/models/product";
import { ProductVariant } from "@/models/product-variant";
import { Inventory } from "@/models/inventory";
import { NotFoundError } from "@/lib/errors";
import type { ProductDetail, ProductAttributeDetail, ProductVariantDetail } from "@/types/product";
import type { CatalogProduct } from "@/types/catalog";

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  await connectDB();

  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .populate("attributes.attribute", "name slug affectsPrice affectsStock affectsSku")
    .populate("attributes.values", "value slug")
    .lean();

  if (!product) throw new NotFoundError("Product");

  const doc = product as Record<string, unknown>;
  const category = doc.category as Record<string, unknown>;
  const images = (doc.images as Array<Record<string, unknown>>) ?? [];
  const rawAttributes = (doc.attributes as Array<Record<string, unknown>>) ?? [];

  const attributes: ProductAttributeDetail[] = rawAttributes.map((attr) => {
    const attrDoc = attr.attribute as Record<string, unknown>;
    const values = (attr.values as Array<Record<string, unknown>>) ?? [];

    return {
      id: String(attrDoc._id),
      name: attrDoc.name as string,
      slug: attrDoc.slug as string,
      affectsPrice: (attrDoc.affectsPrice as boolean) ?? false,
      affectsStock: (attrDoc.affectsStock as boolean) ?? false,
      values: values.map((v) => ({
        id: String(v._id),
        value: v.value as string,
        slug: v.slug as string,
      })),
    };
  });

  let variants: ProductVariantDetail[] = [];
  let stock = 0;

  if (doc.type === "variable") {
    const variantDocs = await ProductVariant.find({
      product: doc._id,
      isActive: true,
    })
      .populate("attributes.attribute", "name slug")
      .populate("attributes.value", "value slug")
      .lean();

    variants = variantDocs.map((v) => {
      const vDoc = v as Record<string, unknown>;
      const vAttrs = (vDoc.attributes as Array<Record<string, unknown>>) ?? [];

      return {
        id: String(vDoc._id),
        attributes: vAttrs.map((a) => {
          const attrRef = a.attribute as Record<string, unknown>;
          const valRef = a.value as Record<string, unknown>;
          return {
            attributeId: String(attrRef._id),
            attributeSlug: attrRef.slug as string,
            valueId: String(valRef._id),
            valueSlug: valRef.slug as string,
            value: valRef.value as string,
          };
        }),
        price: vDoc.price as number,
        salePrice: (vDoc.salePrice as number) ?? null,
        sku: (vDoc.sku as string) ?? "",
        stock: (vDoc.stock as number) ?? 0,
        isActive: (vDoc.isActive as boolean) ?? true,
      };
    });
  }

  // Get stock from Inventory for simple products
  if (doc.type === "simple") {
    const inv = await Inventory.findOne({
      product: doc._id,
      variant: null,
    }).lean();
    stock = inv ? ((inv as Record<string, unknown>).stock as number) : 0;
  }

  return {
    id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    description: (doc.description as string) ?? "",
    shortDescription: (doc.shortDescription as string) ?? "",
    images: images
      .sort((a, b) => ((a.sortOrder as number) ?? 0) - ((b.sortOrder as number) ?? 0))
      .map((img) => ({
        url: img.url as string,
        alt: (img.alt as string) ?? "",
        sortOrder: (img.sortOrder as number) ?? 0,
      })),
    category: {
      id: String(category._id),
      name: category.name as string,
      slug: category.slug as string,
    },
    type: doc.type as "simple" | "variable",
    basePrice: doc.basePrice as number,
    salePrice: (doc.salePrice as number) ?? null,
    sku: (doc.sku as string) ?? "",
    tags: (doc.tags as string[]) ?? [],
    attributes,
    variants,
    stock,
  };
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 4,
): Promise<CatalogProduct[]> {
  await connectDB();

  const products = await Product.find({
    _id: { $ne: productId },
    category: categoryId,
    isActive: true,
  })
    .populate("category", "name slug")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map((doc) => {
    const d = doc as Record<string, unknown>;
    const cat = d.category as Record<string, unknown> | null;
    const imgs = (d.images as Array<Record<string, unknown>>) ?? [];

    return {
      id: String(d._id),
      name: d.name as string,
      slug: d.slug as string,
      basePrice: d.basePrice as number,
      salePrice: (d.salePrice as number) ?? null,
      image: imgs.length > 0 ? (imgs[0].url as string) : undefined,
      categorySlug: cat ? (cat.slug as string) : "",
      categoryName: cat ? (cat.name as string) : "",
      createdAt: d.createdAt ? (d.createdAt as Date).toISOString() : "",
    };
  });
}
