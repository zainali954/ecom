"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { removeFromWishlist } from "../actions";
import { toast } from "sonner";

interface RemoveWishlistButtonProps {
  productId: string;
}

export function RemoveWishlistButton({ productId }: RemoveWishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleRemove() {
    startTransition(async () => {
      const result = await removeFromWishlist(productId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemove}
      disabled={isPending}
      className="h-8 text-xs text-muted-foreground hover:text-destructive"
    >
      {isPending ? "Removing..." : "Remove"}
    </Button>
  );
}
