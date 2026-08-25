"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportUploadZoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isLoading: boolean;
}

export function ImportUploadZone({ onDrop, isLoading }: ImportUploadZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center border border-dashed rounded-3xl p-12 cursor-pointer transition-all duration-300 ease-out min-h-56",
        isDragActive
          ? "border-brand-accent bg-accent/20"
          : "border-border hover:border-brand-accent hover:bg-accent/10",
      )}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 text-brand-accent animate-spin" />
          <p className="text-body font-medium text-foreground">Parsing Excel sheets...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-12 rounded-full bg-accent/30 flex items-center justify-center">
            <Upload className="size-6 text-brand-accent" />
          </div>
          <p className="text-body font-medium text-foreground">
            Drag and drop Excel files here, or click to browse
          </p>
          <p className="text-caption text-muted-foreground">
            Supports .xlsx, .xls, and .csv formats
          </p>
        </div>
      )}
    </div>
  );
}
