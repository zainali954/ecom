import { connectDB } from "@/lib/db";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import type { AdminCategoriesPageData, AdminCategory, CategoryOption } from "@/types/admin";

const CATEGORIES_PER_PAGE = 15;

export async function getAdminCategories(
  page = 1,
  search?: string,
  status?: string,
  parent?: string,
): Promise<AdminCategoriesPageData> {
  await connectDB();

  const filter: Record<string, unknown> = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (status === "active") {
    filter.isActive = true;
  } else if (status === "inactive") {
    filter.isActive = false;
  }

  if (parent === "root") {
    filter.parent = null;
  } else if (parent && parent !== "all") {
    filter.parent = parent;
  }

  const [docs, total] = await Promise.all([
    Category.find(filter)
      .populate("parent", "name")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * CATEGORIES_PER_PAGE)
      .limit(CATEGORIES_PER_PAGE)
      .lean(),
    Category.countDocuments(filter),
  ]);

  const counts = await Product.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  const countMap = new Map<string, number>();
  for (const item of counts) {
    countMap.set(String(item._id), item.count);
  }

  const categories: AdminCategory[] = docs.map((doc) => {
    const d = doc as Record<string, unknown>;
    const parentDoc = d.parent as Record<string, unknown> | null;
    return {
      id: String(d._id),
      name: d.name as string,
      slug: d.slug as string,
      description: (d.description as string) ?? "",
      image: (d.image as string) ?? "",
      parent: parentDoc ? String(parentDoc._id) : null,
      parentName: parentDoc ? (parentDoc.name as string) : null,
      isActive: d.isActive as boolean,
      sortOrder: (d.sortOrder as number) ?? 0,
      productCount: countMap.get(String(d._id)) ?? 0,
      createdAt: d.createdAt
        ? new Date(d.createdAt as string).toISOString()
        : new Date().toISOString(),
      updatedAt: d.updatedAt
        ? new Date(d.updatedAt as string).toISOString()
        : new Date().toISOString(),
    };
  });

  return {
    categories,
    total,
    page,
    totalPages: Math.ceil(total / CATEGORIES_PER_PAGE),
  };
}

export async function getAdminCategoryById(categoryId: string): Promise<AdminCategory | null> {
  await connectDB();

  const doc = await Category.findById(categoryId).populate("parent", "name").lean();
  if (!doc) return null;

  const d = doc as Record<string, unknown>;
  const parentDoc = d.parent as Record<string, unknown> | null;

  const productCount = await Product.countDocuments({ category: d._id });

  return {
    id: String(d._id),
    name: d.name as string,
    slug: d.slug as string,
    description: (d.description as string) ?? "",
    image: (d.image as string) ?? "",
    parent: parentDoc ? String(parentDoc._id) : null,
    parentName: parentDoc ? (parentDoc.name as string) : null,
    isActive: d.isActive as boolean,
    sortOrder: (d.sortOrder as number) ?? 0,
    productCount,
    createdAt: d.createdAt
      ? new Date(d.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: d.updatedAt
      ? new Date(d.updatedAt as string).toISOString()
      : new Date().toISOString(),
  };
}

export async function getCategoryOptions(excludeId?: string): Promise<CategoryOption[]> {
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  const docs = await Category.find(filter).select("name").sort({ name: 1 }).lean();

  return docs.map((d) => ({
    id: String(d._id),
    name: d.name,
  }));
}
