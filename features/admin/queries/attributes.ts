import { connectDB } from "@/lib/db";
import { ProductAttribute } from "@/models/product-attribute";
import { ProductAttributeValue } from "@/models/product-attribute-value";
import type { AdminAttribute, AdminAttributesPageData } from "@/types/admin";

const ATTRIBUTES_PER_PAGE = 15;

export async function getAdminAttributes(
  page = 1,
  search?: string,
): Promise<AdminAttributesPageData> {
  await connectDB();

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const [docs, total] = await Promise.all([
    ProductAttribute.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * ATTRIBUTES_PER_PAGE)
      .limit(ATTRIBUTES_PER_PAGE)
      .lean(),
    ProductAttribute.countDocuments(filter),
  ]);

  const attrIds = docs.map((d) => d._id);
  const valueDocs = await ProductAttributeValue.find({ attribute: { $in: attrIds } })
    .sort({ slug: 1 })
    .lean();

  const valuesByAttr = new Map<string, { id: string; value: string; slug: string }[]>();
  for (const v of valueDocs) {
    const key = String(v.attribute);
    if (!valuesByAttr.has(key)) valuesByAttr.set(key, []);
    valuesByAttr.get(key)!.push({
      id: String(v._id),
      value: v.value as string,
      slug: v.slug as string,
    });
  }

  const attributes: AdminAttribute[] = docs.map((d) => {
    const id = String(d._id);
    const values = valuesByAttr.get(id) ?? [];
    return {
      id,
      name: d.name as string,
      slug: d.slug as string,
      affectsPrice: d.affectsPrice as boolean,
      affectsStock: d.affectsStock as boolean,
      affectsSku: d.affectsSku as boolean,
      valueCount: values.length,
      values,
      createdAt: d.createdAt
        ? new Date(d.createdAt as string).toISOString()
        : new Date().toISOString(),
    };
  });

  return {
    attributes,
    total,
    page,
    totalPages: Math.ceil(total / ATTRIBUTES_PER_PAGE),
  };
}

export async function getAdminAttribute(attributeId: string): Promise<AdminAttribute | null> {
  await connectDB();

  const doc = await ProductAttribute.findById(attributeId).lean();
  if (!doc) return null;

  const valueDocs = await ProductAttributeValue.find({ attribute: doc._id })
    .sort({ slug: 1 })
    .lean();

  const values = valueDocs.map((v) => ({
    id: String(v._id),
    value: v.value as string,
    slug: v.slug as string,
  }));

  return {
    id: String(doc._id),
    name: doc.name as string,
    slug: doc.slug as string,
    affectsPrice: doc.affectsPrice as boolean,
    affectsStock: doc.affectsStock as boolean,
    affectsSku: doc.affectsSku as boolean,
    valueCount: values.length,
    values,
    createdAt: doc.createdAt
      ? new Date(doc.createdAt as string).toISOString()
      : new Date().toISOString(),
  };
}
