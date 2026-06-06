"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { attributeSchema, type AttributeInput } from "@/schemas/attribute";
import {
  createAttribute,
  updateAttribute,
  addAttributeValue,
  deleteAttributeValue,
} from "../../actions/attributes";
import type { AdminAttribute } from "@/types/admin";

interface AttributeFormProps {
  attribute?: AdminAttribute;
}

export function AttributeForm({ attribute }: AttributeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isValuePending, startValueTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!attribute;

  const [values, setValues] = useState(attribute?.values ?? []);
  const [newValue, setNewValue] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttributeInput>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: attribute?.name ?? "",
      slug: attribute?.slug ?? "",
      affectsPrice: attribute?.affectsPrice ?? false,
      affectsStock: attribute?.affectsStock ?? false,
      affectsSku: attribute?.affectsSku ?? false,
    },
  });

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

  function onSubmit(data: AttributeInput) {
    startTransition(async () => {
      if (isEditing) {
        const result = await updateAttribute(attribute.id, data);
        if (result.success) {
          toast.success(result.message);
          router.push("/admin/attributes");
        } else {
          toast.error(result.message);
        }
      } else {
        const result = await createAttribute(data);
        if (result.success && result.id) {
          toast.success(result.message);
          router.push(`/admin/attributes/${result.id}`);
        } else {
          toast.error(result.message);
        }
      }
    });
  }

  function handleAddValue() {
    const trimmed = newValue.trim();
    if (!trimmed) return;
    if (!isEditing) return;

    const valueSlug = generateSlug(trimmed);
    startValueTransition(async () => {
      const result = await addAttributeValue(attribute.id, {
        value: trimmed,
        slug: valueSlug,
      });
      if (result.success && result.value) {
        toast.success(result.message);
        setValues((prev) => [...prev, result.value!]);
        setNewValue("");
      } else if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  function handleDeleteValue(valueId: string) {
    startValueTransition(async () => {
      const result = await deleteAttributeValue(valueId);
      if (result.success) {
        toast.success(result.message);
        setValues(values.filter((v) => v.id !== valueId));
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attribute Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Material"
                  {...register("name", { onChange: handleNameChange })}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" placeholder="e.g. material" {...register("slug")} />
                {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="affectsPrice"
                  checked={watch("affectsPrice") ?? false}
                  onCheckedChange={(v) => setValue("affectsPrice", !!v)}
                />
                <Label htmlFor="affectsPrice" className="cursor-pointer">
                  Affects Price
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="affectsStock"
                  checked={watch("affectsStock") ?? false}
                  onCheckedChange={(v) => setValue("affectsStock", !!v)}
                />
                <Label htmlFor="affectsStock" className="cursor-pointer">
                  Affects Stock
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="affectsSku"
                  checked={watch("affectsSku") ?? false}
                  onCheckedChange={(v) => setValue("affectsSku", !!v)}
                />
                <Label htmlFor="affectsSku" className="cursor-pointer">
                  Affects SKU
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
                ? "Update Attribute"
                : "Create Attribute"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin/attributes")}>
            Cancel
          </Button>
        </div>
      </form>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Values ({values.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a value (e.g. Cotton, XXL, 512GB)..."
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddValue())}
                className="max-w-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddValue}
                disabled={isValuePending || !newValue.trim()}
              >
                {isValuePending ? "Adding..." : "Add"}
              </Button>
            </div>

            {values.length > 0 ? (
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-2 text-left font-medium">Value</th>
                      <th className="px-4 py-2 text-left font-medium">Slug</th>
                      <th className="w-12 px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {values.map((val) => (
                      <tr key={val.id} className="border-b last:border-0">
                        <td className="px-4 py-2">{val.value}</td>
                        <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                          {val.slug}
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteValue(val.id)}
                            disabled={isValuePending}
                          >
                            <TrashIcon />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                No values yet. Add values above so this attribute can be used in product variants.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {!isEditing && (
        <p className="text-sm text-muted-foreground">
          Save the attribute first, then you&apos;ll be able to add values.
        </p>
      )}
    </div>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
