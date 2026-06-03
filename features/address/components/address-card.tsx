"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteAddress, setDefaultAddress } from "../actions";
import { toast } from "sonner";
import type { AddressDetail } from "@/types/address";

interface AddressCardProps {
  address: AddressDetail;
  onEdit: (address: AddressDetail) => void;
}

export function AddressCard({ address, onEdit }: AddressCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAddress(address.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleSetDefault() {
    startTransition(async () => {
      const result = await setDefaultAddress(address.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium">{address.fullName}</h3>
            {address.isDefault && (
              <Badge variant="secondary" className="text-[10px]">
                Default
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{address.phone}</p>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground leading-relaxed">
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.area}, {address.city}
        </p>
        <p>
          {address.province}
          {address.postalCode && ` - ${address.postalCode}`}
        </p>
        {address.landmark && <p>Near: {address.landmark}</p>}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => onEdit(address)}
          disabled={isPending}
        >
          Edit
        </Button>
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleSetDefault}
            disabled={isPending}
          >
            Set Default
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
