"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { productSchema, type ProductInput } from "@/schemas/product";
import { createProduct, updateProduct } from "../../actions/products";
import { ProductImageManager } from "./product-image-manager";
import { ProductLivePreview } from "./product-live-preview";
import { ProductVariantManager, type VariantRow } from "./product-variant-manager";
import type {
  AdminProduct,
  AdminProductVariant,
  CategoryOption,
  AttributeOption,
} from "@/types/admin";

interface ProductFormProps {
  product?: AdminProduct & { variants: AdminProductVariant[] };
  categories: CategoryOption[];
  attributeOptions: AttributeOption[];
}

export function ProductForm({ product, categories, attributeOptions }: ProductFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!product;

  const [images, setImages] = useState(product?.images ?? []);
  const [productType, setProductType] = useState<"simple" | "variable">(product?.type ?? "simple");
  const [tags, setTags] = useState<string[]>(product?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    if (!product?.attributes?.length) return [] as { attributeId: string; valueIds: string[] }[];
    return product.attributes.map((a) => ({
      attributeId: a.attributeId,
      valueIds: a.values.map((v) => v.id),
    }));
  });

  const [variants, setVariants] = useState<VariantRow[]>(() => {
    if (!product?.variants?.length) return [];
    return product.variants.map((v) => ({
      id: v.id,
      attributes: v.attributes.map((a) => ({
        attribute: a.attributeId,
        value: a.valueId,
      })),
      price: v.price,
      salePrice: v.salePrice,
      sku: v.sku,
      stock: v.stock,
      isActive: v.isActive,
    }));
  });

  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      description: product?.description ?? "",
      shortDescription: product?.shortDescription ?? "",
      category: product?.category.id ?? "",
      type: product?.type ?? "simple",
      basePrice: product?.basePrice ?? 0,
      salePrice: product?.salePrice ?? null,
      sku: product?.sku ?? "",
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
      isBestSeller: product?.isBestSeller ?? false,
      stock: product?.stock ?? 0,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEditing) {
      setValue("slug", generateSlug(e.target.value));
    }
  }

  function handleTypeChange(type: "simple" | "variable") {
    setProductType(type);
    setValue("type", type);
  }

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function onSubmit(data: ProductInput) {
    const payload: ProductInput = {
      ...data,
      images,
      tags,
      attributes: selectedAttributes
        .filter((sa) => sa.valueIds.length > 0)
        .map((sa) => ({
          attribute: sa.attributeId,
          values: sa.valueIds,
        })),
      variants:
        productType === "variable"
          ? variants.map((v) => ({
              id: v.id,
              attributes: v.attributes,
              price: v.price,
              salePrice: v.salePrice,
              sku: v.sku,
              stock: v.stock,
              isActive: v.isActive,
            }))
          : undefined,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateProduct(product.id, payload)
        : await createProduct(payload);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/products");
      } else {
        toast.error(result.message);
      }
    });
  }

  const watchedValues = watch();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-8">
        {/* Left: Form */}
        <div className="min-w-0 flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Running Shoes Pro"
                    {...register("name", { onChange: handleNameChange })}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" placeholder="e.g. running-shoes-pro" {...register("slug")} />
                  {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  placeholder="Brief one-liner about the product"
                  {...register("shortDescription")}
                />
                {errors.shortDescription && (
                  <p className="text-xs text-destructive">{errors.shortDescription.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed product description"
                  rows={5}
                  {...register("description")}
                />
              </div>
            </CardContent>
          </Card>

          <ProductImageManager images={images} onChange={setImages} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select
                    value={productType}
                    onValueChange={(v) => handleTypeChange(v as "simple" | "variable")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple Product</SelectItem>
                      <SelectItem value="variable">Variable Product</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={watch("category")} onValueChange={(v) => setValue("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category.message}</p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price (Rs)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register("basePrice", { valueAsNumber: true })}
                  />
                  {errors.basePrice && (
                    <p className="text-xs text-destructive">{errors.basePrice.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price (Rs)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register("salePrice", {
                      setValueAs: (v: string) => (v === "" ? null : Number(v)),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="e.g. RSP-001" {...register("sku")} />
                </div>
              </div>
              {productType === "simple" && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min={0}
                      {...register("stock", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {productType === "variable" && (
            <ProductVariantManager
              attributeOptions={attributeOptions}
              selectedAttributes={selectedAttributes}
              onSelectedAttributesChange={setSelectedAttributes}
              variants={variants}
              onVariantsChange={setVariants}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="max-w-xs"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs"
                      >
                        {tag}
                        <button
                          type="button"
                          className="ml-0.5 hover:text-destructive"
                          onClick={() => removeTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={watch("isActive") ? "active" : "inactive"}
                    onValueChange={(v) => setValue("isActive", v === "active")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Checkbox
                    id="isFeatured"
                    checked={watch("isFeatured") ?? false}
                    onCheckedChange={(v) => setValue("isFeatured", !!v)}
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Featured Product
                  </Label>
                </div>
                <div className="flex items-center gap-2 pt-7">
                  <Checkbox
                    id="isBestSeller"
                    checked={watch("isBestSeller") ?? false}
                    onCheckedChange={(v) => setValue("isBestSeller", !!v)}
                  />
                  <Label htmlFor="isBestSeller" className="cursor-pointer">
                    Best Seller
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? isEditing
                  ? "Updating..."
                  : "Creating..."
                : isEditing
                  ? "Update Product"
                  : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden w-[380px] flex-shrink-0 xl:block">
          <div className="sticky top-6">
            <Card>
              <CardContent className="p-5">
                <ProductLivePreview
                  name={watchedValues.name}
                  shortDescription={watchedValues.shortDescription ?? ""}
                  description={watchedValues.description ?? ""}
                  images={images}
                  basePrice={watchedValues.basePrice ?? 0}
                  salePrice={watchedValues.salePrice ?? null}
                  sku={watchedValues.sku ?? ""}
                  stock={watchedValues.stock ?? 0}
                  category={watchedValues.category ?? ""}
                  categories={categories}
                  tags={tags}
                  isActive={watchedValues.isActive ?? true}
                  isFeatured={watchedValues.isFeatured ?? false}
                  isBestSeller={watchedValues.isBestSeller ?? false}
                  productType={productType}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  );
}
