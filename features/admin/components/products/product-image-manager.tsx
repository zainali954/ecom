"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface ProductImage {
  url: string;
  alt: string;
  sortOrder: number;
}

interface ProductImageManagerProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

export function ProductImageManager({ images, onChange }: ProductImageManagerProps) {
  const [url, setUrl] = useState("");

  function addImage() {
    if (!url.trim()) return;
    onChange([...images, { url: url.trim(), alt: "", sortOrder: images.length }]);
    setUrl("");
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated.map((img, i) => ({ ...img, sortOrder: i })));
  }

  function updateAlt(index: number, alt: string) {
    const updated = images.map((img, i) => (i === index ? { ...img, alt } : img));
    onChange(updated);
  }

  function moveImage(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const updated = [...images];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated.map((img, i) => ({ ...img, sortOrder: i })));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addImage}>
            Add
          </Button>
        </div>

        {images.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image, index) => (
              <div key={index} className="group relative rounded-lg border bg-card p-2">
                <img
                  src={image.url}
                  alt={image.alt || "Product image"}
                  className="aspect-square w-full rounded-md object-cover"
                />
                <div className="mt-2 space-y-1">
                  <Input
                    placeholder="Alt text"
                    value={image.alt}
                    onChange={(e) => updateAlt(index, e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === images.length - 1}
                      >
                        <ArrowDownIcon />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeImage(index)}
                    >
                      <TrashIcon />
                    </Button>
                  </div>
                </div>
                {index === 0 && (
                  <Label className="absolute left-3 top-3 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                    Main
                  </Label>
                )}
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No images added yet. Paste a URL above to add one.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ArrowUpIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
