"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRef } from "react";

export function AttributeFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(value: string) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (!value) {
        params.delete("search");
      } else {
        params.set("search", value);
      }
      params.delete("page");
      router.push(`/admin/attributes?${params.toString()}`);
    }, 400);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search attributes..."
        defaultValue={searchParams.get("search") ?? ""}
        onChange={(e) => handleSearch(e.target.value)}
        className="sm:max-w-xs"
      />
      <Button asChild>
        <Link href="/admin/attributes/new">Add Attribute</Link>
      </Button>
    </div>
  );
}
