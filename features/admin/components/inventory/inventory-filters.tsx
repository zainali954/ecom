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
import { useRef } from "react";

export function InventoryFilters() {
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
    router.push(`/admin/inventory?${params.toString()}`);
  }

  function handleSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => updateParams("search", value), 400);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="Search by product name..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={searchParams.get("stockLevel") ?? "all"}
        onValueChange={(v) => updateParams("stockLevel", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Stock Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="out">Out of Stock</SelectItem>
          <SelectItem value="low">Low Stock</SelectItem>
          <SelectItem value="adequate">Adequate</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={searchParams.get("productType") ?? "all"}
        onValueChange={(v) => updateParams("productType", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Product Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="simple">Simple</SelectItem>
          <SelectItem value="variable">Variable</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
