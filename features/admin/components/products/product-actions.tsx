"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { AdminProduct } from "@/types/admin";
import { deleteProduct, toggleProductStatus, toggleProductFeatured } from "../../actions/products";

interface ProductActionsProps {
  product: AdminProduct;
}

export function ProductActions({ product }: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  function handleToggleStatus() {
    startTransition(async () => {
      const result = await toggleProductStatus(product.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleToggleFeatured() {
    startTransition(async () => {
      const result = await toggleProductFeatured(product.id);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProduct(product.id);
      setShowDeleteDialog(false);
      if (result.success) toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
            <MoreIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => router.push(`/admin/products/${product.id}`)}>
            Edit Product
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleFeatured}>
            {product.isFeatured ? "Remove Featured" : "Mark Featured"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {product.isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            Delete Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{product.name}&quot;? This will also remove all
              variants, inventory, and uploaded images. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
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
