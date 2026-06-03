"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addressSchema, PROVINCES } from "@/schemas/address";
import { createAddress, updateAddress } from "../actions";
import { toast } from "sonner";
import type { AddressInput } from "@/schemas/address";
import type { AddressDetail } from "@/types/address";

interface AddressFormProps {
  address?: AddressDetail | null;
  onSuccess?: () => void;
}

export function AddressForm({ address, onSuccess }: AddressFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: address?.fullName ?? "",
      phone: address?.phone ?? "",
      alternatePhone: address?.alternatePhone ?? "",
      province: address?.province as AddressInput["province"] | undefined,
      city: address?.city ?? "",
      area: address?.area ?? "",
      addressLine1: address?.addressLine1 ?? "",
      addressLine2: address?.addressLine2 ?? "",
      postalCode: address?.postalCode ?? "",
      landmark: address?.landmark ?? "",
      isDefault: address?.isDefault ?? false,
    },
  });

  const currentProvince = watch("province");
  const isDefault = watch("isDefault");

  function onSubmit(data: AddressInput) {
    startTransition(async () => {
      const result = isEditing ? await updateAddress(address!.id, data) : await createAddress(data);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        onSuccess?.();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs">
            Full Name *
          </Label>
          <Input id="fullName" {...register("fullName")} className="h-9 text-sm" />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">
            Phone Number *
          </Label>
          <Input
            id="phone"
            {...register("phone")}
            className="h-9 text-sm"
            placeholder="03XX-XXXXXXX"
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="alternatePhone" className="text-xs">
            Alternate Phone
          </Label>
          <Input id="alternatePhone" {...register("alternatePhone")} className="h-9 text-sm" />
          {errors.alternatePhone && (
            <p className="text-xs text-destructive">{errors.alternatePhone.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="province" className="text-xs">
            Province *
          </Label>
          <Select
            value={currentProvince}
            onValueChange={(val) =>
              setValue("province", val as AddressInput["province"], { shouldValidate: true })
            }
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              {PROVINCES.map((province) => (
                <SelectItem key={province} value={province} className="text-sm">
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.province && <p className="text-xs text-destructive">{errors.province.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="city" className="text-xs">
            City *
          </Label>
          <Input id="city" {...register("city")} className="h-9 text-sm" />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="area" className="text-xs">
            Area *
          </Label>
          <Input id="area" {...register("area")} className="h-9 text-sm" />
          {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addressLine1" className="text-xs">
          Address Line 1 *
        </Label>
        <Input
          id="addressLine1"
          {...register("addressLine1")}
          className="h-9 text-sm"
          placeholder="Street address, house number"
        />
        {errors.addressLine1 && (
          <p className="text-xs text-destructive">{errors.addressLine1.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addressLine2" className="text-xs">
          Address Line 2
        </Label>
        <Input
          id="addressLine2"
          {...register("addressLine2")}
          className="h-9 text-sm"
          placeholder="Apartment, suite, floor"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="postalCode" className="text-xs">
            Postal Code
          </Label>
          <Input id="postalCode" {...register("postalCode")} className="h-9 text-sm" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="landmark" className="text-xs">
            Landmark
          </Label>
          <Input
            id="landmark"
            {...register("landmark")}
            className="h-9 text-sm"
            placeholder="Near..."
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={isDefault}
          onCheckedChange={(checked) => setValue("isDefault", checked === true)}
        />
        Set as default address
      </label>

      <div className="flex justify-end gap-2 pt-2">
        {onSuccess && (
          <Button type="button" variant="outline" size="sm" onClick={onSuccess}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Update Address" : "Add Address"}
        </Button>
      </div>
    </form>
  );
}
