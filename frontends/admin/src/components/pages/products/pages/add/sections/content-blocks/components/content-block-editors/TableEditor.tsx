"use client";

import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function TableEditor({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const content = watch(`contentBlocks.${index}.content`) as {
    headers: string[];
    rows: string[][];
  };
  const headers = content?.headers || ["Column 1", "Column 2"];
  const rows = content?.rows || [["", ""]];

  const updateContent = (newHeaders: string[], newRows: string[][]) => {
    setValue(`contentBlocks.${index}.content`, { headers: newHeaders, rows: newRows });
  };

  const handleHeaderChange = (i: number, value: string) => {
    const updated = [...headers];
    updated[i] = value;
    updateContent(updated, rows);
  };

  const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
    const updated = rows.map((r) => [...r]);
    updated[rowIdx][colIdx] = value;
    updateContent(headers, updated);
  };

  const handleAddRow = () => {
    updateContent(headers, [...rows, Array(headers.length).fill("")]);
  };

  const handleRemoveRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    updateContent(
      headers,
      rows.filter((_, i) => i !== rowIdx),
    );
  };

  const handleAddColumn = () => {
    const newHeaders = [...headers, `Column ${headers.length + 1}`];
    const newRows = rows.map((r) => [...r, ""]);
    updateContent(newHeaders, newRows);
  };

  const handleRemoveColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== colIdx);
    const newRows = rows.map((r) => r.filter((_, i) => i !== colIdx));
    updateContent(newHeaders, newRows);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="p-0">
                  <div className="flex items-center gap-1">
                    <Input
                      value={header}
                      onChange={(e) => handleHeaderChange(i, e.target.value)}
                      className="text-xs font-semibold"
                      placeholder="Header"
                    />
                    <IconButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveColumn(i)}
                      disabled={headers.length <= 1}
                    >
                      <X size={12} />
                    </IconButton>
                  </div>
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="p-0 pt-2 pr-2">
                    <Input
                      value={cell}
                      onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                      placeholder="—"
                      className="text-xs"
                    />
                  </td>
                ))}
                <td className="p-0 pt-2">
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRow(rowIdx)}
                    disabled={rows.length <= 1}
                  >
                    <X size={12} />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddRow}
          startIcon={<Plus size={14} />}
          className="text-xs hover:text-foreground"
        >
          <span className="text-muted-foreground-lighter">Add row</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleAddColumn}
          startIcon={<Plus size={14} />}
          className="text-xs hover:text-foreground"
        >
          <span className="text-muted-foreground-lighter">Add column</span>
        </Button>
      </div>
    </div>
  );
}
