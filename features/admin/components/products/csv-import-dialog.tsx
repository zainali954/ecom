"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { importProductsFromCSV } from "@/features/admin/actions/import";

interface ImportResult {
  created: number;
  total: number;
  errors: { row: number; message: string }[];
}

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleReset() {
    setResult(null);
    setLoading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await importProductsFromCSV(formData);
      setResult(res);
    } catch {
      setResult({
        created: 0,
        total: 0,
        errors: [{ row: 0, message: "Import failed unexpectedly" }],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) handleReset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Products from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk-create products. Download the{" "}
            <a
              href="/api/admin/products/csv-template"
              className="font-medium text-foreground underline underline-offset-2"
            >
              template file
            </a>{" "}
            for the expected format.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="csv-file" className="text-sm font-medium">
                CSV File
              </label>
              <input
                ref={fileRef}
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                className="mt-1.5 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Supports simple and variable products. Variable products use continuation rows
                (empty name) for additional variants.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={loading}>
                {loading ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-green-600">{result.created}</p>
                  <p className="text-xs text-muted-foreground">Created</p>
                </div>
                {result.errors.length > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-destructive">
                      {result.errors.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Errors</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="text-2xl font-semibold">{result.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-medium">Row</th>
                      <th className="px-3 py-1.5 text-left font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((err, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-1.5 text-muted-foreground">{err.row}</td>
                        <td className="px-3 py-1.5">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button onClick={handleReset}>Import Another</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
