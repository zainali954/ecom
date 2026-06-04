import type { PipelineStage } from "mongoose";
import { connectDB } from "@/lib/db";
import { Inventory } from "@/models/inventory";
import { Product } from "@/models/product";
import { ProductVariant } from "@/models/product-variant";
import type { AdminInventoryItem, AdminInventoryPageData } from "@/types/admin";

const INVENTORY_PER_PAGE = 20;

export async function getAdminInventory(
  page = 1,
  search?: string,
  stockLevel?: string,
  productType?: string,
): Promise<AdminInventoryPageData> {
  await connectDB();

  const pipeline: PipelineStage[] = [];

  pipeline.push({
    $lookup: {
      from: "products",
      localField: "product",
      foreignField: "_id",
      as: "productDoc",
    },
  });
  pipeline.push({ $unwind: "$productDoc" });

  pipeline.push({
    $lookup: {
      from: "productvariants",
      localField: "variant",
      foreignField: "_id",
      as: "variantDoc",
    },
  });
  pipeline.push({
    $unwind: { path: "$variantDoc", preserveNullAndEmptyArrays: true },
  });

  const matchStage: Record<string, unknown> = {};

  if (search) {
    matchStage["productDoc.name"] = { $regex: search, $options: "i" };
  }

  if (productType && productType !== "all") {
    matchStage["productDoc.type"] = productType;
  }

  if (stockLevel === "out") {
    matchStage.stock = 0;
  } else if (stockLevel === "low") {
    matchStage.$expr = { $lte: ["$stock", "$lowStockThreshold"] };
    matchStage.stock = { $gt: 0 };
  } else if (stockLevel === "adequate") {
    matchStage.$expr = { $gt: ["$stock", "$lowStockThreshold"] };
  }

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  pipeline.push({ $sort: { "productDoc.name": 1, createdAt: -1 } });

  const countPipeline: PipelineStage[] = [...pipeline, { $count: "total" as const }];

  pipeline.push({ $skip: (page - 1) * INVENTORY_PER_PAGE });
  pipeline.push({ $limit: INVENTORY_PER_PAGE });

  const [docs, countResult] = await Promise.all([
    Inventory.aggregate(pipeline),
    Inventory.aggregate(countPipeline),
  ]);

  const total = countResult[0]?.total ?? 0;

  const variantIds = docs.filter((d) => d.variantDoc).map((d) => d.variantDoc._id);

  const variantAttributes: Map<string, { attributeName: string; value: string }[]> = new Map();

  if (variantIds.length > 0) {
    const variants = await ProductVariant.find({ _id: { $in: variantIds } })
      .populate("attributes.attribute", "name")
      .populate("attributes.value", "value")
      .lean();

    for (const v of variants) {
      const vd = v as Record<string, unknown>;
      const attrs = (vd.attributes as Array<Record<string, unknown>>) ?? [];
      variantAttributes.set(
        String(vd._id),
        attrs.map((a) => {
          const attr = a.attribute as Record<string, unknown>;
          const val = a.value as Record<string, unknown>;
          return {
            attributeName: (attr?.name as string) ?? "",
            value: (val?.value as string) ?? "",
          };
        }),
      );
    }
  }

  const items: AdminInventoryItem[] = docs.map((doc) => {
    const product = doc.productDoc;
    const variant = doc.variantDoc;

    return {
      id: String(doc._id),
      product: {
        id: String(product._id),
        name: product.name,
        slug: product.slug,
        type: product.type,
      },
      variant: variant
        ? {
            id: String(variant._id),
            attributes: variantAttributes.get(String(variant._id)) ?? [],
          }
        : null,
      sku: doc.sku ?? "",
      stock: doc.stock ?? 0,
      lowStockThreshold: doc.lowStockThreshold ?? 5,
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
    };
  });

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / INVENTORY_PER_PAGE),
  };
}

export async function getAdminInventoryById(
  inventoryId: string,
): Promise<AdminInventoryItem | null> {
  await connectDB();

  const doc = await Inventory.findById(inventoryId)
    .populate({
      path: "product",
      select: "name slug type",
    })
    .lean();

  if (!doc) return null;

  const d = doc as Record<string, unknown>;
  const product = d.product as Record<string, unknown>;

  let variantData: AdminInventoryItem["variant"] = null;

  if (d.variant) {
    const variant = await ProductVariant.findById(d.variant)
      .populate("attributes.attribute", "name")
      .populate("attributes.value", "value")
      .lean();

    if (variant) {
      const vd = variant as Record<string, unknown>;
      const attrs = (vd.attributes as Array<Record<string, unknown>>) ?? [];
      variantData = {
        id: String(vd._id),
        attributes: attrs.map((a) => {
          const attr = a.attribute as Record<string, unknown>;
          const val = a.value as Record<string, unknown>;
          return {
            attributeName: (attr?.name as string) ?? "",
            value: (val?.value as string) ?? "",
          };
        }),
      };
    }
  }

  return {
    id: String(d._id),
    product: {
      id: String(product._id),
      name: product.name as string,
      slug: product.slug as string,
      type: product.type as "simple" | "variable",
    },
    variant: variantData,
    sku: (d.sku as string) ?? "",
    stock: (d.stock as number) ?? 0,
    lowStockThreshold: (d.lowStockThreshold as number) ?? 5,
    createdAt: d.createdAt
      ? new Date(d.createdAt as string).toISOString()
      : new Date().toISOString(),
    updatedAt: d.updatedAt
      ? new Date(d.updatedAt as string).toISOString()
      : new Date().toISOString(),
  };
}
