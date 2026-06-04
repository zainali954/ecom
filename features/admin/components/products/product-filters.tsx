"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef } from "react";
import type { CategoryOption } from "@/types/admin";
import { CsvImportDialog } from "./csv-import-dialog";

interface ProductFiltersProps {
  categories: CategoryOption[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/admin/products?${params.toString()}`);
  }

  function handleSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateParams("search", value), 400);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search products..."
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          defaultValue={searchParams.get("category") ?? "all"}
          onValueChange={(v) => updateParams("category", v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          defaultValue={searchParams.get("type") ?? "all"}
          onValueChange={(v) => updateParams("type", v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="simple">Simple</SelectItem>
            <SelectItem value="variable">Variable</SelectItem>
          </SelectContent>
        </Select>
        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onValueChange={(v) => updateParams("status", v)}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <CsvImportDialog />
        <Button asChild>
          <Link href="/admin/products/new">Add Product</Link>
        </Button>
      </div>
    </div>
  );
}
