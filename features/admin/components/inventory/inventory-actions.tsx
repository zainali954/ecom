"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { AdminInventoryItem } from "@/types/admin";
import { adjustStock } from "../../actions/inventory";

interface InventoryActionsProps {
  item: AdminInventoryItem;
}

export function InventoryActions({ item }: InventoryActionsProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdjust(amount: number) {
    startTransition(async () => {
      const result = await adjustStock(item.id, amount);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
          <MoreIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push(`/admin/inventory/${item.id}`)}>
          Edit Inventory
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleAdjust(1)}>Add 1 Stock</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAdjust(5)}>Add 5 Stock</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAdjust(10)}>Add 10 Stock</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleAdjust(-1)}
          disabled={item.stock < 1}
          className="text-destructive focus:text-destructive"
        >
          Remove 1 Stock
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoreIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}
