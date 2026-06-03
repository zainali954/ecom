import { connectDB } from "@/lib/db";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { NotFoundError } from "@/lib/errors";
import type {
  CatalogCategory,
  CatalogProduct,
  CatalogSearchParams,
  FilterCategory,
  PaginationMeta,
  ProductListResult,
} from "@/types/catalog";

const PRODUCTS_PER_PAGE = 12;

function buildSortQuery(sort?: string): Record<string, 1 | -1> {
  switch (sort) {
    case "price-asc":
      return { basePrice: 1 };
    case "price-desc":
      return { basePrice: -1 };
    case "name-asc":
      return { name: 1 };
    case "name-desc":
      return { name: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

function buildPriceFilter(minPrice?: string, maxPrice?: string) {
  const min = minPrice ? Number(minPrice) : null;
  const max = maxPrice ? Number(maxPrice) : null;

  if (min === null && max === null) return {};

  const priceConditions: Record<string, unknown>[] = [];

  const salePriceMatch: Record<string, unknown> = { salePrice: { $ne: null } };
  const basePriceMatch: Record<string, unknown> = { salePrice: null };

  if (min !== null) {
    (salePriceMatch.salePrice as Record<string, unknown>).$gte = min;
    basePriceMatch.basePrice = {
      ...((basePriceMatch.basePrice as Record<string, unknown>) ?? {}),
      $gte: min,
    };
  }
  if (max !== null) {
    (salePriceMatch.salePrice as Record<string, unknown>).$lte = max;
    basePriceMatch.basePrice = {
      ...((basePriceMatch.basePrice as Record<string, unknown>) ?? {}),
      $lte: max,
    };
  }

  priceConditions.push(salePriceMatch, basePriceMatch);

  return { $or: priceConditions };
}

function serializeProduct(doc: Record<string, unknown>): CatalogProduct {
  const category = doc.category as Record<string, unknown> | null;
  const images = (doc.images as Array<Record<string, unknown>>) ?? [];

  return {
    id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    basePrice: doc.basePrice as number,
    salePrice: (doc.salePrice as number) ?? null,
    image: images.length > 0 ? (images[0].url as string) : undefined,
    categorySlug: category ? (category.slug as string) : "",
    categoryName: category ? (category.name as string) : "",
    createdAt: doc.createdAt ? (doc.createdAt as Date).toISOString() : "",
  };
}

export async function getAllCategories(): Promise<CatalogCategory[]> {
  await connectDB();

  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 }).lean();

  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  for (const item of counts) {
    countMap.set(String(item._id), item.count);
  }

  return categories.map((cat) => ({
    id: String(cat._id),
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? "",
    image: cat.image ?? "",
    productCount: countMap.get(String(cat._id)) ?? 0,
    parent: cat.parent ? String(cat.parent) : null,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<CatalogCategory> {
  await connectDB();

  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) throw new NotFoundError("Category");

  const productCount = await Product.countDocuments({
    category: category._id,
    isActive: true,
  });

  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image ?? "",
    productCount,
    parent: category.parent ? String(category.parent) : null,
  };
}

export async function getProducts(params: CatalogSearchParams): Promise<ProductListResult> {
  await connectDB();

  const filter: Record<string, unknown> = { isActive: true };

  if (params.q) {
    filter.name = { $regex: params.q, $options: "i" };
  }

  if (params.category) {
    const cat = await Category.findOne({ slug: params.category, isActive: true }).lean();
    if (cat) {
      filter.category = cat._id;
    }
  }

  const priceFilter = buildPriceFilter(params.minPrice, params.maxPrice);
  const combinedFilter = { ...filter, ...priceFilter };

  const page = Math.max(1, Number(params.page) || 1);
  const sort = buildSortQuery(params.sort);

  const [products, totalItems] = await Promise.all([
    Product.find(combinedFilter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE)
      .lean(),
    Product.countDocuments(combinedFilter),
  ]);

  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);

  const pagination: PaginationMeta = {
    currentPage: page,
    totalPages,
    totalItems,
    limit: PRODUCTS_PER_PAGE,
  };

  return {
    products: products.map((doc) => serializeProduct(doc as Record<string, unknown>)),
    pagination,
  };
}

export async function getProductsByCategory(
  slug: string,
  params: CatalogSearchParams,
): Promise<ProductListResult & { category: CatalogCategory }> {
  await connectDB();

  const categoryDoc = await Category.findOne({ slug, isActive: true }).lean();
  if (!categoryDoc) throw new NotFoundError("Category");

  const filter: Record<string, unknown> = {
    isActive: true,
    category: categoryDoc._id,
  };

  const priceFilter = buildPriceFilter(params.minPrice, params.maxPrice);
  const combinedFilter = { ...filter, ...priceFilter };

  const page = Math.max(1, Number(params.page) || 1);
  const sort = buildSortQuery(params.sort);

  const [products, totalItems] = await Promise.all([
    Product.find(combinedFilter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * PRODUCTS_PER_PAGE)
      .limit(PRODUCTS_PER_PAGE)
      .lean(),
    Product.countDocuments(combinedFilter),
  ]);

  const totalPages = Math.ceil(totalItems / PRODUCTS_PER_PAGE);

  const category: CatalogCategory = {
    id: String(categoryDoc._id),
    name: categoryDoc.name,
    slug: categoryDoc.slug,
    description: categoryDoc.description ?? "",
    image: categoryDoc.image ?? "",
    productCount: totalItems,
    parent: categoryDoc.parent ? String(categoryDoc.parent) : null,
  };

  return {
    category,
    products: products.map((doc) => serializeProduct(doc as Record<string, unknown>)),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      limit: PRODUCTS_PER_PAGE,
    },
  };
}

export async function getPriceRange(): Promise<{ min: number; max: number }> {
  await connectDB();

  const result = await Product.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        min: { $min: "$basePrice" },
        max: { $max: "$basePrice" },
      },
    },
  ]);

  if (result.length === 0) return { min: 0, max: 10000 };
  return { min: result[0].min ?? 0, max: result[0].max ?? 10000 };
}

export async function getCategoriesForFilter(): Promise<FilterCategory[]> {
  await connectDB();

  const categories = await Category.find({ isActive: true })
    .select("name slug")
    .sort({ sortOrder: 1 })
    .lean();

  const counts = await Product.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = new Map<string, number>();
  for (const item of counts) {
    countMap.set(String(item._id), item.count);
  }

  return categories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    productCount: countMap.get(String(cat._id)) ?? 0,
  }));
}
