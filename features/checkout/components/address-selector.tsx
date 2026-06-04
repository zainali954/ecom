"use client";

import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AddressDetail } from "@/types/address";

interface AddressSelectorProps {
  addresses: AddressDetail[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function AddressSelector({ addresses, selectedId, onSelect }: AddressSelectorProps) {
  if (addresses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center">
        <p className="text-sm text-muted-foreground">No saved addresses</p>
        <Button asChild size="sm" className="mt-3">
          <Link href="/account/addresses">Add Address</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RadioGroup value={selectedId} onValueChange={onSelect}>
        {addresses.map((address) => (
          <label
            key={address.id}
            htmlFor={`address-${address.id}`}
            className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
              selectedId === address.id ? "border-primary bg-muted/30" : ""
            }`}
          >
            <RadioGroupItem value={address.id} id={`address-${address.id}`} className="mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{address.fullName}</span>
                {address.isDefault && (
                  <Badge variant="secondary" className="text-[10px]">
                    Default
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{address.phone}</p>
              <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.area}, {address.city}, {address.province}
                  {address.postalCode && ` - ${address.postalCode}`}
                </p>
              </div>
            </div>
          </label>
        ))}
      </RadioGroup>

      <Button variant="outline" size="sm" className="text-xs" asChild>
        <Link href="/account/addresses">Manage Addresses</Link>
      </Button>
    </div>
  );
}
