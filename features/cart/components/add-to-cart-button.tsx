"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "../actions";
import { toast } from "sonner";

interface AddToCartButtonProps {
  productId: string;
  variantId: string | null;
  disabled: boolean;
  label: string;
}

export function AddToCartButton({ productId, variantId, disabled, label }: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleAdd() {
    startTransition(async () => {
      const result = await addToCart(productId, variantId, 1);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button size="lg" className="flex-1" onClick={handleAdd} disabled={disabled || isPending}>
      {isPending ? "Adding..." : label}
    </Button>
  );
}
