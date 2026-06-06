"use server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { ProductAttribute } from "@/models/product-attribute";
import { ProductAttributeValue } from "@/models/product-attribute-value";
import { ProductVariant } from "@/models/product-variant";
import { revalidatePath } from "next/cache";
import { attributeSchema, attributeValueSchema } from "@/schemas/attribute";

export async function createAttribute(data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = attributeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const existing = await ProductAttribute.findOne({ slug: parsed.data.slug }).lean();
  if (existing) {
    return { success: false, message: "An attribute with this slug already exists" };
  }

  const attr = await ProductAttribute.create({
    name: parsed.data.name,
    slug: parsed.data.slug,
    affectsPrice: parsed.data.affectsPrice ?? false,
    affectsStock: parsed.data.affectsStock ?? false,
    affectsSku: parsed.data.affectsSku ?? false,
  });

  revalidatePath("/admin/attributes");

  return { success: true, message: "Attribute created successfully", id: String(attr._id) };
}

export async function updateAttribute(attributeId: string, data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = attributeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const attribute = await ProductAttribute.findById(attributeId);
  if (!attribute) {
    return { success: false, message: "Attribute not found" };
  }

  const duplicate = await ProductAttribute.findOne({
    slug: parsed.data.slug,
    _id: { $ne: attributeId },
  }).lean();
  if (duplicate) {
    return { success: false, message: "An attribute with this slug already exists" };
  }

  attribute.name = parsed.data.name;
  attribute.slug = parsed.data.slug;
  attribute.affectsPrice = parsed.data.affectsPrice ?? false;
  attribute.affectsStock = parsed.data.affectsStock ?? false;
  attribute.affectsSku = parsed.data.affectsSku ?? false;

  await attribute.save();

  revalidatePath("/admin/attributes");
  revalidatePath(`/admin/attributes/${attributeId}`);

  return { success: true, message: "Attribute updated successfully" };
}

export async function deleteAttribute(attributeId: string) {
  await requireAdmin();
  await connectDB();

  const attribute = await ProductAttribute.findById(attributeId);
  if (!attribute) {
    return { success: false, message: "Attribute not found" };
  }

  const variantCount = await ProductVariant.countDocuments({
    "attributes.attribute": attributeId,
  });
  if (variantCount > 0) {
    return {
      success: false,
      message: `Cannot delete: ${variantCount} product variant(s) use this attribute`,
    };
  }

  await ProductAttributeValue.deleteMany({ attribute: attributeId });
  await ProductAttribute.findByIdAndDelete(attributeId);

  revalidatePath("/admin/attributes");

  return { success: true, message: "Attribute deleted successfully" };
}

export async function addAttributeValue(attributeId: string, data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = attributeValueSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const attribute = await ProductAttribute.findById(attributeId);
  if (!attribute) {
    return { success: false, message: "Attribute not found" };
  }

  const existing = await ProductAttributeValue.findOne({
    attribute: attributeId,
    slug: parsed.data.slug,
  }).lean();
  if (existing) {
    return { success: false, message: "A value with this slug already exists for this attribute" };
  }

  const val = await ProductAttributeValue.create({
    attribute: attributeId,
    value: parsed.data.value,
    slug: parsed.data.slug,
  });

  revalidatePath("/admin/attributes");
  revalidatePath(`/admin/attributes/${attributeId}`);

  return {
    success: true,
    message: "Value added successfully",
    value: { id: String(val._id), value: parsed.data.value, slug: parsed.data.slug },
  };
}

export async function updateAttributeValue(valueId: string, data: unknown) {
  await requireAdmin();
  await connectDB();

  const parsed = attributeValueSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0].message };
  }

  const val = await ProductAttributeValue.findById(valueId);
  if (!val) {
    return { success: false, message: "Value not found" };
  }

  const duplicate = await ProductAttributeValue.findOne({
    attribute: val.attribute,
    slug: parsed.data.slug,
    _id: { $ne: valueId },
  }).lean();
  if (duplicate) {
    return { success: false, message: "A value with this slug already exists for this attribute" };
  }

  val.value = parsed.data.value;
  val.slug = parsed.data.slug;
  await val.save();

  revalidatePath("/admin/attributes");

  return { success: true, message: "Value updated successfully" };
}

export async function deleteAttributeValue(valueId: string) {
  await requireAdmin();
  await connectDB();

  const val = await ProductAttributeValue.findById(valueId);
  if (!val) {
    return { success: false, message: "Value not found" };
  }

  const variantCount = await ProductVariant.countDocuments({
    "attributes.value": valueId,
  });
  if (variantCount > 0) {
    return {
      success: false,
      message: `Cannot delete: ${variantCount} product variant(s) use this value`,
    };
  }

  await ProductAttributeValue.findByIdAndDelete(valueId);

  revalidatePath("/admin/attributes");

  return { success: true, message: "Value deleted successfully" };
}

const DEFAULT_ATTRIBUTES = [
  {
    name: "Size",
    slug: "size",
    affectsPrice: true,
    affectsStock: true,
    affectsSku: true,
    values: [
      { value: "S", slug: "s" },
      { value: "M", slug: "m" },
      { value: "L", slug: "l" },
      { value: "XL", slug: "xl" },
    ],
  },
  {
    name: "Color",
    slug: "color",
    affectsPrice: false,
    affectsStock: true,
    affectsSku: true,
    values: [
      { value: "Black", slug: "black" },
      { value: "White", slug: "white" },
      { value: "Red", slug: "red" },
      { value: "Blue", slug: "blue" },
    ],
  },
  {
    name: "Storage",
    slug: "storage",
    affectsPrice: true,
    affectsStock: true,
    affectsSku: true,
    values: [
      { value: "64GB", slug: "64gb" },
      { value: "128GB", slug: "128gb" },
      { value: "256GB", slug: "256gb" },
    ],
  },
];

export async function ensureDefaultAttributes() {
  await connectDB();

  for (const def of DEFAULT_ATTRIBUTES) {
    const existing = await ProductAttribute.findOne({ slug: def.slug }).lean();
    if (existing) continue;

    const attr = await ProductAttribute.create({
      name: def.name,
      slug: def.slug,
      affectsPrice: def.affectsPrice,
      affectsStock: def.affectsStock,
      affectsSku: def.affectsSku,
    });

    await ProductAttributeValue.insertMany(
      def.values.map((v) => ({
        attribute: attr._id,
        value: v.value,
        slug: v.slug,
      })),
    );
  }
}
