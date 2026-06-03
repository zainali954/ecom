"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleWishlist } from "../actions";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  isWishlisted: boolean;
  variant?: "icon" | "default";
  className?: string;
}

export function WishlistButton({
  productId,
  isWishlisted,
  variant = "icon",
  className,
}: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggle}
        disabled={isPending}
        className={cn("h-9 w-9 shrink-0", className)}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <HeartIcon filled={isWishlisted} />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleToggle}
      disabled={isPending}
      className={className}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <HeartIcon filled={isWishlisted} />
    </Button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(filled && "text-red-500")}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
