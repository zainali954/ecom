"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Address } from "@/models/address";
import { addressSchema } from "@/schemas/address";
import { logger } from "@/lib/logger";
import type { AddressInput } from "@/schemas/address";

interface AddressActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function createAddress(data: AddressInput): Promise<AddressActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in" };
    }

    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return { success: false, message: "Validation failed", errors };
    }

    await connectDB();

    // If this is the first address or marked as default, unset other defaults
    if (parsed.data.isDefault) {
      await Address.updateMany({ user: session.user.id }, { $set: { isDefault: false } });
    }

    // If no addresses exist, make this default
    const existingCount = await Address.countDocuments({ user: session.user.id });
    const isDefault = existingCount === 0 ? true : (parsed.data.isDefault ?? false);

    await Address.create({
      user: session.user.id,
      ...parsed.data,
      isDefault,
    });

    revalidatePath("/account/addresses");
    return { success: true, message: "Address added successfully" };
  } catch (error) {
    logger.error("Create address error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function updateAddress(
  addressId: string,
  data: AddressInput,
): Promise<AddressActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in" };
    }

    const parsed = addressSchema.safeParse(data);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = [];
        errors[key].push(issue.message);
      }
      return { success: false, message: "Validation failed", errors };
    }

    await connectDB();

    const address = await Address.findOne({ _id: addressId, user: session.user.id });
    if (!address) {
      return { success: false, message: "Address not found" };
    }

    if (parsed.data.isDefault) {
      await Address.updateMany(
        { user: session.user.id, _id: { $ne: addressId } },
        { $set: { isDefault: false } },
      );
    }

    Object.assign(address, parsed.data);
    await address.save();

    revalidatePath("/account/addresses");
    return { success: true, message: "Address updated successfully" };
  } catch (error) {
    logger.error("Update address error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function deleteAddress(addressId: string): Promise<AddressActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in" };
    }

    await connectDB();

    const address = await Address.findOneAndDelete({
      _id: addressId,
      user: session.user.id,
    });

    if (!address) {
      return { success: false, message: "Address not found" };
    }

    // If deleted address was default, set the first remaining as default
    if (address.isDefault) {
      const firstAddress = await Address.findOne({ user: session.user.id })
        .sort({ createdAt: -1 })
        .lean();
      if (firstAddress) {
        await Address.updateOne({ _id: firstAddress._id }, { $set: { isDefault: true } });
      }
    }

    revalidatePath("/account/addresses");
    return { success: true, message: "Address deleted successfully" };
  } catch (error) {
    logger.error("Delete address error:", error);
    return { success: false, message: "Something went wrong" };
  }
}

export async function setDefaultAddress(addressId: string): Promise<AddressActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "Please log in" };
    }

    await connectDB();

    const address = await Address.findOne({ _id: addressId, user: session.user.id });
    if (!address) {
      return { success: false, message: "Address not found" };
    }

    await Address.updateMany({ user: session.user.id }, { $set: { isDefault: false } });

    address.isDefault = true;
    await address.save();

    revalidatePath("/account/addresses");
    return { success: true, message: "Default address updated" };
  } catch (error) {
    logger.error("Set default address error:", error);
    return { success: false, message: "Something went wrong" };
  }
}
