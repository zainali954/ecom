import type { Metadata } from "next";
import { getUserAddresses } from "@/features/address/queries";
import { AddressList } from "@/features/address/components/address-list";

export const metadata: Metadata = {
  title: "Addresses",
  description: "Manage your delivery addresses",
  robots: { index: false, follow: false },
};

export default async function AddressesPage() {
  const addresses = await getUserAddresses();

  return <AddressList addresses={addresses} />;
}
