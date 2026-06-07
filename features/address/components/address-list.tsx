"use client";

import { useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { AddressForm } from "./address-form";
import { AddressCard } from "./address-card";
import type { AddressDetail } from "@/types/address";

interface AddressListProps {
  addresses: AddressDetail[];
}

export function AddressList({ addresses }: AddressListProps) {
  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressDetail | null>(null);
  const isDesktop = useMediaQuery("(min-width: 640px)");

  function handleEdit(address: AddressDetail) {
    setEditingAddress(address);
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    setEditingAddress(null);
  }

  function handleAddNew() {
    setEditingAddress(null);
    setOpen(true);
  }

  const title = editingAddress ? "Edit Address" : "Add New Address";
  const description = editingAddress
    ? "Update your delivery address details."
    : "Enter your delivery address details.";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Your Addresses</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {addresses.length === 0
              ? "No addresses saved"
              : `${addresses.length} ${addresses.length === 1 ? "address" : "addresses"} saved`}
          </p>
        </div>

        {isDesktop ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={handleAddNew}>
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
              </DialogHeader>
              <AddressForm address={editingAddress} onSuccess={handleClose} />
            </DialogContent>
          </Dialog>
        ) : (
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
              <Button size="sm" onClick={handleAddNew}>
                Add Address
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="text-left">
                <DrawerTitle>{title}</DrawerTitle>
                <DrawerDescription>{description}</DrawerDescription>
              </DrawerHeader>
              <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">
                <AddressForm address={editingAddress} onSuccess={handleClose} />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {addresses.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <MapPinIcon />
          <p className="mt-4 text-sm text-muted-foreground">
            Add a delivery address to get started
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground/40"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
