import { connectDB } from "@/lib/db";
import { auth } from "@/auth";
import { Address } from "@/models/address";
import type { AddressDetail } from "@/types/address";

export async function getUserAddresses(): Promise<AddressDetail[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  await connectDB();

  const addresses = await Address.find({ user: session.user.id })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  return addresses.map((doc) => ({
    id: String(doc._id),
    fullName: doc.fullName,
    phone: doc.phone,
    alternatePhone: doc.alternatePhone ?? "",
    province: doc.province,
    city: doc.city,
    area: doc.area,
    addressLine1: doc.addressLine1,
    addressLine2: doc.addressLine2 ?? "",
    postalCode: doc.postalCode ?? "",
    landmark: doc.landmark ?? "",
    isDefault: doc.isDefault ?? false,
  }));
}

export async function getAddressById(id: string): Promise<AddressDetail | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();

  const doc = await Address.findOne({ _id: id, user: session.user.id }).lean();
  if (!doc) return null;

  return {
    id: String(doc._id),
    fullName: doc.fullName,
    phone: doc.phone,
    alternatePhone: doc.alternatePhone ?? "",
    province: doc.province,
    city: doc.city,
    area: doc.area,
    addressLine1: doc.addressLine1,
    addressLine2: doc.addressLine2 ?? "",
    postalCode: doc.postalCode ?? "",
    landmark: doc.landmark ?? "",
    isDefault: doc.isDefault ?? false,
  };
}
