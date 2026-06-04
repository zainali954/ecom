"use server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { Product } from "@/models/product";
import { ProductVariant } from "@/models/product-variant";
import { Inventory } from "@/models/inventory";
import { revalidatePath } from "next/cache";
import { productSchema } from "@/schemas/product";

export async function createProduct(data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const existing = await Product.findOne({ slug: parsed.data.slug }).lean();
  if (existing) {
    return { success: false, message: "A product with this slug already exists" };
  }

  const product = await Product.create({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? "",
    shortDescription: parsed.data.shortDescription ?? "",
    images: (parsed.data.images ?? []).map((img, i) => ({
      url: img.url,
      alt: img.alt ?? "",
      sortOrder: img.sortOrder ?? i,
    })),
    category: parsed.data.category,
    type: parsed.data.type,
    basePrice: parsed.data.basePrice,
    salePrice: parsed.data.salePrice ?? null,
    sku: parsed.data.sku ?? "",
    attributes: (parsed.data.attributes ?? []).map((a) => ({
      attribute: a.attribute,
      values: a.values,
    })),
    isActive: parsed.data.isActive ?? true,
    isFeatured: parsed.data.isFeatured ?? false,
    isBestSeller: parsed.data.isBestSeller ?? false,
    tags: parsed.data.tags ?? [],
  });

  if (parsed.data.type === "simple") {
    await Inventory.create({
      product: product._id,
      variant: null,
      stock: parsed.data.stock ?? 0,
      sku: parsed.data.sku ?? "",
    });
  }

  if (parsed.data.type === "variable" && parsed.data.variants?.length) {
    for (const v of parsed.data.variants) {
      const variant = await ProductVariant.create({
        product: product._id,
        attributes: v.attributes.map((a) => ({
          attribute: a.attribute,
          value: a.value,
        })),
        price: v.price,
        salePrice: v.salePrice ?? null,
        sku: v.sku ?? "",
        isActive: v.isActive ?? true,
      });
      await Inventory.create({
        product: product._id,
        variant: variant._id,
        stock: v.stock ?? 0,
        sku: v.sku ?? "",
      });
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true, message: "Product created successfully" };
}

export async function updateProduct(productId: string, data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = productSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const product = await Product.findById(productId);
  if (!product) {
    return { success: false, message: "Product not found" };
  }

  const duplicate = await Product.findOne({
    slug: parsed.data.slug,
    _id: { $ne: productId },
  }).lean();
  if (duplicate) {
    return { success: false, message: "A product with this slug already exists" };
  }

  product.name = parsed.data.name;
  product.slug = parsed.data.slug;
  product.description = parsed.data.description ?? "";
  product.shortDescription = parsed.data.shortDescription ?? "";
  product.images = (parsed.data.images ?? []).map((img, i) => ({
    url: img.url,
    alt: img.alt ?? "",
    sortOrder: img.sortOrder ?? i,
  }));
  product.category = parsed.data.category;
  product.type = parsed.data.type;
  product.basePrice = parsed.data.basePrice;
  product.salePrice = parsed.data.salePrice ?? null;
  product.sku = parsed.data.sku ?? "";
  product.attributes = (parsed.data.attributes ?? []).map((a) => ({
    attribute: a.attribute,
    values: a.values,
  }));
  product.isActive = parsed.data.isActive ?? product.isActive;
  product.isFeatured = parsed.data.isFeatured ?? product.isFeatured;
  product.isBestSeller = parsed.data.isBestSeller ?? product.isBestSeller;
  product.tags = parsed.data.tags ?? [];

  await product.save();

  if (parsed.data.type === "simple") {
    await Inventory.findOneAndUpdate(
      { product: productId, variant: null },
      { stock: parsed.data.stock ?? 0, sku: parsed.data.sku ?? "" },
      { upsert: true },
    );
  }

  if (parsed.data.type === "variable" && parsed.data.variants) {
    const existingVariants = await ProductVariant.find({ product: productId }).lean();
    const existingIds = new Set(existingVariants.map((v) => String(v._id)));
    const incomingIds = new Set(parsed.data.variants.filter((v) => v.id).map((v) => v.id!));

    for (const eid of existingIds) {
      if (!incomingIds.has(eid)) {
        await ProductVariant.findByIdAndDelete(eid);
        await Inventory.deleteOne({ product: productId, variant: eid });
      }
    }

    for (const v of parsed.data.variants) {
      if (v.id && existingIds.has(v.id)) {
        await ProductVariant.findByIdAndUpdate(v.id, {
          attributes: v.attributes.map((a) => ({
            attribute: a.attribute,
            value: a.value,
          })),
          price: v.price,
          salePrice: v.salePrice ?? null,
          sku: v.sku ?? "",
          isActive: v.isActive ?? true,
        });
        await Inventory.findOneAndUpdate(
          { product: productId, variant: v.id },
          { stock: v.stock ?? 0, sku: v.sku ?? "" },
          { upsert: true },
        );
      } else {
        const variant = await ProductVariant.create({
          product: productId,
          attributes: v.attributes.map((a) => ({
            attribute: a.attribute,
            value: a.value,
          })),
          price: v.price,
          salePrice: v.salePrice ?? null,
          sku: v.sku ?? "",
          isActive: v.isActive ?? true,
        });
        await Inventory.create({
          product: productId,
          variant: variant._id,
          stock: v.stock ?? 0,
          sku: v.sku ?? "",
        });
      }
    }
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  revalidatePath(`/product/${product.slug}`);

  return { success: true, message: "Product updated successfully" };
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  await connectDB();

  const product = await Product.findById(productId);
  if (!product) {
    return { success: false, message: "Product not found" };
  }

  await Promise.all([
    ProductVariant.deleteMany({ product: productId }),
    Inventory.deleteMany({ product: productId }),
    Product.findByIdAndDelete(productId),
  ]);

  revalidatePath("/admin/products");
  revalidatePath("/products");

  return { success: true, message: "Product deleted successfully" };
}

export async function toggleProductStatus(productId: string) {
  await requireAdmin();
  await connectDB();

  const product = await Product.findById(productId);
  if (!product) {
    return { success: false, message: "Product not found" };
  }

  product.isActive = !product.isActive;
  await product.save();

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");

  return {
    success: true,
    message: `Product ${product.isActive ? "activated" : "deactivated"} successfully`,
  };
}

export async function toggleProductFeatured(productId: string) {
  await requireAdmin();
  await connectDB();

  const product = await Product.findById(productId);
  if (!product) {
    return { success: false, message: "Product not found" };
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);

  return {
    success: true,
    message: `Product ${product.isFeatured ? "marked as featured" : "removed from featured"} successfully`,
  };
}
