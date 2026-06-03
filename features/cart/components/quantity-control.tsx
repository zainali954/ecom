"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateCartItemQuantity } from "../actions";
import { toast } from "sonner";

interface QuantityControlProps {
  itemId: string;
  quantity: number;
  maxStock: number;
}

export function QuantityControl({ itemId, quantity, maxStock }: QuantityControlProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleUpdate(newQuantity: number) {
    if (newQuantity < 1 || newQuantity > maxStock) return;

    startTransition(async () => {
      const result = await updateCartItemQuantity(itemId, newQuantity);
      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={() => handleUpdate(quantity - 1)}
        disabled={isPending || quantity <= 1}
      >
        <MinusIcon />
      </Button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7"
        onClick={() => handleUpdate(quantity + 1)}
        disabled={isPending || quantity >= maxStock}
      >
        <PlusIcon />
      </Button>
    </div>
  );
}

function MinusIcon() {
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
      <path d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
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
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
