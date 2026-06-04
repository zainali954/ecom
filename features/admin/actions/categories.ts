"use server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { Category } from "@/models/category";
import { Product } from "@/models/product";
import { revalidatePath } from "next/cache";
import { categorySchema } from "@/schemas/category";

export async function createCategory(data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const existing = await Category.findOne({ slug: parsed.data.slug }).lean();
  if (existing) {
    return { success: false, message: "A category with this slug already exists" };
  }

  await Category.create({
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description ?? "",
    image: parsed.data.image ?? "",
    parent: parsed.data.parent || null,
    isActive: parsed.data.isActive ?? true,
    sortOrder: parsed.data.sortOrder ?? 0,
  });

  revalidatePath("/admin/categories");
  revalidatePath("/categories");

  return { success: true, message: "Category created successfully" };
}

export async function updateCategory(categoryId: string, data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return { success: false, message: "Category not found" };
  }

  const duplicate = await Category.findOne({
    slug: parsed.data.slug,
    _id: { $ne: categoryId },
  }).lean();
  if (duplicate) {
    return { success: false, message: "A category with this slug already exists" };
  }

  if (parsed.data.parent === categoryId) {
    return { success: false, message: "A category cannot be its own parent" };
  }

  category.name = parsed.data.name;
  category.slug = parsed.data.slug;
  category.description = parsed.data.description ?? "";
  category.image = parsed.data.image ?? "";
  category.parent = parsed.data.parent || null;
  category.isActive = parsed.data.isActive ?? category.isActive;
  category.sortOrder = parsed.data.sortOrder ?? category.sortOrder;

  await category.save();

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");

  return { success: true, message: "Category updated successfully" };
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  await connectDB();

  const category = await Category.findById(categoryId);
  if (!category) {
    return { success: false, message: "Category not found" };
  }

  const productCount = await Product.countDocuments({ category: categoryId });
  if (productCount > 0) {
    return {
      success: false,
      message: `Cannot delete: ${productCount} product(s) are assigned to this category`,
    };
  }

  const childCount = await Category.countDocuments({ parent: categoryId });
  if (childCount > 0) {
    return {
      success: false,
      message: `Cannot delete: ${childCount} subcategory(ies) belong to this category`,
    };
  }

  await Category.findByIdAndDelete(categoryId);

  revalidatePath("/admin/categories");
  revalidatePath("/categories");

  return { success: true, message: "Category deleted successfully" };
}

export async function toggleCategoryStatus(categoryId: string) {
  await requireAdmin();
  await connectDB();

  const category = await Category.findById(categoryId);
  if (!category) {
    return { success: false, message: "Category not found" };
  }

  category.isActive = !category.isActive;
  await category.save();

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${categoryId}`);
  revalidatePath("/categories");

  return {
    success: true,
    message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
  };
}
