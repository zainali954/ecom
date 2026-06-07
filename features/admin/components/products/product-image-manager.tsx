"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef, useState, useCallback } from "react";

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
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [url, setUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      setUploading(true);

      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }

      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          setError("Upload failed. Please try again.");
          return;
        }

        const data = await res.json();

        if (data.errors?.length > 0) {
          setError(data.errors.join(", "));
        }

        if (data.results?.length > 0) {
          const newImages: ProductImage[] = data.results.map((r: { url: string }, i: number) => ({
            url: r.url,
            alt: "",
            sortOrder: images.length + i,
          }));
          onChange([...images, ...newImages]);
        }
      } catch {
        setError("Upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [images, onChange],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = "";
    }
  }

  function addUrl() {
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
        {/* Upload drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          } ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={handleFileSelect}
            className="hidden"
          />
          {uploading ? (
            <>
              <SpinnerIcon />
              <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <UploadIcon />
              <p className="mt-2 text-sm font-medium">Drop images here or click to browse</p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP, GIF, AVIF — max 5MB each
              </p>
            </>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* URL input toggle */}
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => setShowUrlInput(!showUrlInput)}
          >
            {showUrlInput ? "Hide URL input" : "Or add image by URL"}
          </Button>
          {showUrlInput && (
            <div className="mt-1 flex gap-2">
              <Input
                placeholder="Paste image URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addUrl}>
                Add
              </Button>
            </div>
          )}
        </div>

        {/* Image grid */}
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
            No images added yet. Upload files or add a URL above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-muted-foreground"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-spin text-muted-foreground"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
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
