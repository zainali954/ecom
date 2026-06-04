import { connectDB } from "@/lib/db";
import { Product } from "@/models/product";
import { ProductVariant } from "@/models/product-variant";
import { ProductAttribute } from "@/models/product-attribute";
import { ProductAttributeValue } from "@/models/product-attribute-value";
import { Inventory } from "@/models/inventory";
import type {
  AdminProduct,
  AdminProductsPageData,
  AdminProductVariant,
  AttributeOption,
} from "@/types/admin";

const PRODUCTS_PER_PAGE = 15;

export async function getAdminProducts(
  page = 1,
  search?: string,
  category?: string,
  type?: string,
  status?: string,
): Promise<AdminProductsPageData> {
  await connectDB();

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (category && category !== "all") {
    filter.category = category;
  }

  if (type && type !== "all") {
    filter.type = type;
  }

  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  const [docs, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const productIds = docs.map((d) => d._id);

  const [variantCounts, inventoryDocs] = await Promise.all([
    ProductVariant.aggregate([
      { $match: { product: { $in: productIds } } },
      { $group: { _id: "$product", count: { $sum: 1 } } },
    ]),
    Inventory.find({ product: { $in: productIds }, variant: null }).lean(),
  ]);

  const variantMap = new Map<string, number>();
  for (const vc of variantCounts) {
    variantMap.set(String(vc._id), vc.count);
  }

  const stockMap = new Map<string, number>();
  for (const inv of inventoryDocs) {
    stockMap.set(String(inv.product), inv.stock);
  }

  const products: AdminProduct[] = docs.map((doc) => {
    const d = doc as Record<string, unknown>;
    const cat = d.category as Record<string, unknown> | null;
    const images = (d.images as Array<Record<string, unknown>>) ?? [];
    const attrs = (d.attributes as Array<Record<string, unknown>>) ?? [];
    const pid = String(d._id);

    return {
      id: pid,
      name: d.name as string,
      slug: d.slug as string,
      description: (d.description as string) ?? "",
      shortDescription: (d.shortDescription as string) ?? "",
      images: images.map((img) => ({
        url: img.url as string,
        alt: (img.alt as string) ?? "",
        sortOrder: (img.sortOrder as number) ?? 0,
      })),
      category: cat ? { id: String(cat._id), name: cat.name as string } : { id: "", name: "" },
      type: d.type as "simple" | "variable",
      basePrice: d.basePrice as number,
      salePrice: (d.salePrice as number) ?? null,
      sku: (d.sku as string) ?? "",
      attributes: attrs.map((a) => ({
        attributeId: String(a.attribute),
        attributeName: "",
        values: ((a.values as string[]) ?? []).map((v) => ({ id: String(v), value: "" })),
      })),
      isActive: d.isActive as boolean,
      isFeatured: (d.isFeatured as boolean) ?? false,
      isBestSeller: (d.isBestSeller as boolean) ?? false,
      tags: (d.tags as string[]) ?? [],
      variantCount: variantMap.get(pid) ?? 0,
      stock: stockMap.get(pid) ?? 0,
      createdAt: d.createdAt
        ? new Date(d.createdAt as string).toISOString()
        : new Date().toISOString(),
      updatedAt: d.updatedAt
        ? new Date(d.updatedAt as string).toISOString()
        : new Date().toISOString(),
    };
  });

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
  };
}

export async function getAdminProductById(
  productId: string,
): Promise<(AdminProduct & { variants: AdminProductVariant[] }) | null> {
  await connectDB();

  const doc = await Product.findById(productId)
    .populate("category", "name")
    .populate("attributes.attribute", "name slug")
    .populate("attributes.values", "value slug")
    .lean();

  if (!doc) return null;

  const d = doc as Record<string, unknown>;
  const cat = d.category as Record<string, unknown> | null;
  const images = (d.images as Array<Record<string, unknown>>) ?? [];
  const attrs = (d.attributes as Array<Record<string, unknown>>) ?? [];

  const variants = await ProductVariant.find({ product: productId })
    .populate("attributes.attribute", "name slug")
    .populate("attributes.value", "value slug")
    .lean();

  const inventory = await Inventory.findOne({ product: productId, variant: null }).lean();

  const adminVariants: AdminProductVariant[] = variants.map((v) => {
    const vd = v as Record<string, unknown>;
    const vAttrs = (vd.attributes as Array<Record<string, unknown>>) ?? [];
    return {
      id: String(vd._id),
      attributes: vAttrs.map((a) => {
        const attr = a.attribute as Record<string, unknown>;
        const val = a.value as Record<string, unknown>;
        return {
          attributeId: String(attr._id),
          attributeName: attr.name as string,
          valueId: String(val._id),
          value: val.value as string,
        };
      }),
      price: vd.price as number,
      salePrice: (vd.salePrice as number) ?? null,
      sku: (vd.sku as string) ?? "",
      stock: (vd.stock as number) ?? 0,
      isActive: vd.isActive as boolean,
    };
  });

  return {
    id: String(d._id),
    name: d.name as string,
    slug: d.slug as string,
    description: (d.description as string) ?? "",
    shortDescription: (d.shortDescription as string) ?? "",
    images: images.map((img) => ({
      url: img.url as string,
      alt: (img.alt as string) ?? "",
      sortOrder: (img.sortOrder as number) ?? 0,
    })),
    category: cat ? { id: String(cat._id), name: cat.name as string } : { id: "", name: "" },
    type: d.type as "simple" | "variable",
    basePrice: d.basePrice as number,
    salePrice: (d.salePrice as number) ?? null,
    sku: (d.sku as string) ?? "",
    attributes: attrs.map((a) => {
      const attr = a.attribute as Record<string, unknown>;
      const vals = (a.values as Array<Record<string, unknown>>) ?? [];
      return {
        attributeId: String(attr._id),
        attributeName: attr.name as string,
        values: vals.map((v) => ({ id: String(v._id), value: v.value as string })),
      };
    }),
    isActive: d.isActive as boolean,
    isFeatured: (d.isFeatured as boolean) ?? false,
    isBestSeller: (d.isBestSeller as boolean) ?? false,
    tags: (d.tags as string[]) ?? [],
    variantCount: adminVariants.length,
    stock: inventory ? (inventory.stock as number) : 0,
    createdAt: d.createdAt
      ? new Date(d.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: d.updatedAt
      ? new Date(d.updatedAt as string).toISOString()
      : new Date().toISOString(),
    variants: adminVariants,
  };
}

export async function getAttributeOptions(): Promise<AttributeOption[]> {
  await connectDB();

  const attrs = await ProductAttribute.find().sort({ name: 1 }).lean();
  const values = await ProductAttributeValue.find().sort({ value: 1 }).lean();

  const valuesByAttr = new Map<string, { id: string; value: string; slug: string }[]>();
  for (const v of values) {
    const attrId = String(v.attribute);
    if (!valuesByAttr.has(attrId)) valuesByAttr.set(attrId, []);
    valuesByAttr.get(attrId)!.push({
      id: String(v._id),
      value: v.value,
      slug: v.slug,
    });
  }

  return attrs.map((a) => ({
    id: String(a._id),
    name: a.name,
    slug: a.slug,
    affectsPrice: a.affectsPrice ?? false,
    affectsStock: a.affectsStock ?? false,
    affectsSku: a.affectsSku ?? false,
    values: valuesByAttr.get(String(a._id)) ?? [],
  }));
}
