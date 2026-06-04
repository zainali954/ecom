"use server";

import Papa from "papaparse";
import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { Product } from "@/models/product";
import { ProductVariant } from "@/models/product-variant";
import { Inventory } from "@/models/inventory";
import { Category } from "@/models/category";
import { ProductAttribute } from "@/models/product-attribute";
import { ProductAttributeValue } from "@/models/product-attribute-value";
import { revalidatePath } from "next/cache";

interface CsvRow {
  name?: string;
  slug?: string;
  category?: string;
  type?: string;
  basePrice?: string;
  salePrice?: string;
  sku?: string;
  stock?: string;
  description?: string;
  shortDescription?: string;
  tags?: string;
  isActive?: string;
  isFeatured?: string;
  isBestSeller?: string;
  images?: string;
  variantAttributes?: string;
  variantValues?: string;
  variantPrice?: string;
  variantSalePrice?: string;
  variantSku?: string;
  variantStock?: string;
}

interface ProductGroup {
  parentRow: CsvRow;
  rowNumber: number;
  variantRows: { row: CsvRow; rowNumber: number }[];
}

interface ImportResult {
  created: number;
  total: number;
  errors: { row: number; message: string }[];
}

function parseBool(val: string | undefined): boolean {
  if (!val) return true;
  const lower = val.trim().toLowerCase();
  return lower !== "false" && lower !== "0" && lower !== "no";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function importProductsFromCSV(formData: FormData): Promise<ImportResult> {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file) {
    return { created: 0, total: 0, errors: [{ row: 0, message: "No file provided" }] };
  }

  const text = await file.text();
  const { data, errors: parseErrors } = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parseErrors.length > 0) {
    return {
      created: 0,
      total: 0,
      errors: parseErrors.map((e) => ({ row: e.row ?? 0, message: e.message })),
    };
  }

  if (data.length === 0) {
    return { created: 0, total: 0, errors: [{ row: 0, message: "CSV file is empty" }] };
  }

  await connectDB();

  const categories = await Category.find({ isActive: true }).lean();
  const categoryMap = new Map<string, string>();
  for (const cat of categories) {
    categoryMap.set((cat.name as string).toLowerCase(), String(cat._id));
    categoryMap.set(cat.slug as string, String(cat._id));
  }

  const groups: ProductGroup[] = [];
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const name = row.name?.trim();

    if (name) {
      groups.push({ parentRow: row, rowNumber: i + 2, variantRows: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].variantRows.push({ row, rowNumber: i + 2 });
    }
  }

  const result: ImportResult = { created: 0, total: groups.length, errors: [] };

  for (const group of groups) {
    try {
      await processProductGroup(group, categoryMap, result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      result.errors.push({ row: group.rowNumber, message: msg });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return result;
}

async function processProductGroup(
  group: ProductGroup,
  categoryMap: Map<string, string>,
  result: ImportResult,
) {
  const { parentRow, rowNumber } = group;

  const name = parentRow.name?.trim();
  if (!name) {
    result.errors.push({ row: rowNumber, message: "Product name is required" });
    return;
  }

  const slug = parentRow.slug?.trim() || slugify(name);
  const categoryKey = parentRow.category?.trim().toLowerCase();
  if (!categoryKey) {
    result.errors.push({ row: rowNumber, message: "Category is required" });
    return;
  }

  const categoryId = categoryMap.get(categoryKey);
  if (!categoryId) {
    result.errors.push({ row: rowNumber, message: `Category "${parentRow.category}" not found` });
    return;
  }

  const type = (parentRow.type?.trim().toLowerCase() || "simple") as "simple" | "variable";
  if (type !== "simple" && type !== "variable") {
    result.errors.push({
      row: rowNumber,
      message: `Invalid type "${parentRow.type}". Use "simple" or "variable"`,
    });
    return;
  }

  const basePrice = Number(parentRow.basePrice);
  if (isNaN(basePrice) || basePrice < 0) {
    result.errors.push({ row: rowNumber, message: "basePrice must be a valid number >= 0" });
    return;
  }

  const existing = await Product.findOne({ slug }).lean();
  if (existing) {
    result.errors.push({ row: rowNumber, message: `Slug "${slug}" already exists` });
    return;
  }

  const salePrice = parentRow.salePrice ? Number(parentRow.salePrice) : null;
  const images = parentRow.images
    ? parentRow.images.split("|").map((url, i) => ({ url: url.trim(), alt: "", sortOrder: i }))
    : [];
  const tags = parentRow.tags
    ? parentRow.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (type === "simple") {
    const stock = parentRow.stock ? parseInt(parentRow.stock, 10) : 0;

    const product = await Product.create({
      name,
      slug,
      description: parentRow.description?.trim() ?? "",
      shortDescription: parentRow.shortDescription?.trim() ?? "",
      images,
      category: categoryId,
      type: "simple",
      basePrice,
      salePrice,
      sku: parentRow.sku?.trim() ?? "",
      attributes: [],
      isActive: parseBool(parentRow.isActive),
      isFeatured: parseBool(parentRow.isFeatured) && parentRow.isFeatured !== undefined,
      isBestSeller: parseBool(parentRow.isBestSeller) && parentRow.isBestSeller !== undefined,
      tags,
    });

    await Inventory.create({
      product: product._id,
      variant: null,
      stock: isNaN(stock) ? 0 : stock,
      sku: parentRow.sku?.trim() ?? "",
    });

    result.created++;
    return;
  }

  // Variable product
  const allVariantRows = [];
  if (parentRow.variantAttributes && parentRow.variantValues) {
    allVariantRows.push({ row: parentRow, rowNumber });
  }
  for (const vr of group.variantRows) {
    if (vr.row.variantAttributes && vr.row.variantValues) {
      allVariantRows.push(vr);
    }
  }

  if (allVariantRows.length === 0) {
    result.errors.push({
      row: rowNumber,
      message: "Variable product must have at least one variant row",
    });
    return;
  }

  const attrNamesSet = new Set<string>();
  const parsedVariants: {
    attrPairs: { attrName: string; valueName: string }[];
    price: number;
    salePrice: number | null;
    sku: string;
    stock: number;
    rowNum: number;
  }[] = [];

  for (const vr of allVariantRows) {
    const attrNames = vr.row.variantAttributes!.split(":").map((a) => a.trim());
    const attrValues = vr.row.variantValues!.split(":").map((v) => v.trim());

    if (attrNames.length !== attrValues.length) {
      result.errors.push({
        row: vr.rowNumber,
        message:
          "variantAttributes and variantValues must have the same number of colon-separated items",
      });
      return;
    }

    const attrPairs = attrNames.map((an, idx) => ({ attrName: an, valueName: attrValues[idx] }));
    attrPairs.forEach((p) => attrNamesSet.add(p.attrName));

    const vPrice = vr.row.variantPrice ? Number(vr.row.variantPrice) : basePrice;
    const vSalePrice = vr.row.variantSalePrice ? Number(vr.row.variantSalePrice) : null;
    const vStock = vr.row.variantStock ? parseInt(vr.row.variantStock, 10) : 0;

    parsedVariants.push({
      attrPairs,
      price: isNaN(vPrice) ? basePrice : vPrice,
      salePrice: vSalePrice !== null && isNaN(vSalePrice) ? null : vSalePrice,
      sku: vr.row.variantSku?.trim() ?? "",
      stock: isNaN(vStock) ? 0 : vStock,
      rowNum: vr.rowNumber,
    });
  }

  // Resolve or create attributes and values
  const attrIdMap = new Map<string, string>(); // attrName -> attrId
  const valueIdMap = new Map<string, string>(); // "attrName:valueName" -> valueId
  const productAttributes: { attribute: string; values: string[] }[] = [];

  for (const attrName of attrNamesSet) {
    const attrSlug = slugify(attrName);
    let attr = await ProductAttribute.findOne({ slug: attrSlug }).lean();
    if (!attr) {
      attr = await ProductAttribute.create({
        name: attrName,
        slug: attrSlug,
        affectsPrice: true,
        affectsStock: true,
        affectsSku: true,
      });
    }
    attrIdMap.set(attrName, String(attr._id));
  }

  // Collect all unique values per attribute
  const attrValuesCollector = new Map<string, Set<string>>();
  for (const pv of parsedVariants) {
    for (const pair of pv.attrPairs) {
      if (!attrValuesCollector.has(pair.attrName)) {
        attrValuesCollector.set(pair.attrName, new Set());
      }
      attrValuesCollector.get(pair.attrName)!.add(pair.valueName);
    }
  }

  for (const [attrName, valueNames] of attrValuesCollector) {
    const attrId = attrIdMap.get(attrName)!;
    const valueIds: string[] = [];

    for (const valName of valueNames) {
      const valSlug = slugify(valName);
      let val = await ProductAttributeValue.findOne({
        attribute: attrId,
        slug: valSlug,
      }).lean();
      if (!val) {
        val = await ProductAttributeValue.create({
          attribute: attrId,
          value: valName,
          slug: valSlug,
        });
      }
      const valId = String(val._id);
      valueIdMap.set(`${attrName}:${valName}`, valId);
      valueIds.push(valId);
    }

    productAttributes.push({ attribute: attrId, values: valueIds });
  }

  const product = await Product.create({
    name,
    slug,
    description: parentRow.description?.trim() ?? "",
    shortDescription: parentRow.shortDescription?.trim() ?? "",
    images,
    category: categoryId,
    type: "variable",
    basePrice,
    salePrice,
    sku: parentRow.sku?.trim() ?? "",
    attributes: productAttributes,
    isActive: parseBool(parentRow.isActive),
    isFeatured: parseBool(parentRow.isFeatured) && parentRow.isFeatured !== undefined,
    isBestSeller: parseBool(parentRow.isBestSeller) && parentRow.isBestSeller !== undefined,
    tags,
  });

  for (const pv of parsedVariants) {
    const variantAttrs = pv.attrPairs.map((pair) => ({
      attribute: attrIdMap.get(pair.attrName)!,
      value: valueIdMap.get(`${pair.attrName}:${pair.valueName}`)!,
    }));

    const variant = await ProductVariant.create({
      product: product._id,
      attributes: variantAttrs,
      price: pv.price,
      salePrice: pv.salePrice,
      sku: pv.sku,
      isActive: true,
    });

    await Inventory.create({
      product: product._id,
      variant: variant._id,
      stock: pv.stock,
      sku: pv.sku,
    });
  }

  result.created++;
}
