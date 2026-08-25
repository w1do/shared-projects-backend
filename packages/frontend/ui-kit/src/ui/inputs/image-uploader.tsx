import * as React from "react";
import { Upload, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";

export interface ImageUploaderProps {
  value: string[];
  onChange: (value: string[]) => void;
  maxFiles?: number;
  accept?: string;
  multiple?: boolean;
  placeholder?: string;
  description?: string;
  showPrimary?: boolean;
  error?: string;
  aspectRatio?: "square" | "video" | "banner" | "logo";
  previewClassName?: string;
}

export function ImageUploader({
  value = [],
  onChange,
  maxFiles,
  accept = "image/*",
  multiple = true,
  placeholder = "Drag & drop beauty shots here",
  description = "Supports JPEG, PNG, WEBP (min 1200x1200px for catalog zoom)",
  showPrimary = false,
  error,
  aspectRatio = "square",
  previewClassName,
}: ImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (maxFiles && value.length + files.length > maxFiles) {
      // Could show a toast, but keeping it simple
      return;
    }

    const newImages: string[] = [...value];
    let loadedCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          newImages.push(reader.result);
        }
        loadedCount++;
        if (loadedCount === files.length) {
          onChange(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;

    if (maxFiles && value.length + files.length > maxFiles) {
      return;
    }

    const newImages: string[] = [...value];
    let loadedCount = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          newImages.push(reader.result);
        }
        loadedCount++;
        if (loadedCount === files.length) {
          onChange(newImages);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx: number) => {
    const updated = value.filter((_, i) => i !== idx);
    onChange(updated);
  };

  const handleSetPrimary = (idx: number) => {
    if (idx === 0) return;
    const updated = [value[idx], ...value.filter((_, i) => i !== idx)];
    onChange(updated);
  };

  const isLimitReached = maxFiles ? value.length >= maxFiles : false;

  return (
    <div className="space-y-4">
      {/* Uploader Dropzone */}
      {!isLimitReached && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-border hover:border-primary/60 bg-muted/50 cursor-pointer py-10 px-4 rounded-(--radius-2xl) transition-all flex flex-col items-center justify-center gap-2 group text-center"
        >
          <input
            type="file"
            multiple={multiple}
            accept={accept}
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="h-8 w-8 rounded-(--radius-xl) bg-background flex items-center justify-center text-muted-foreground shadow-subtle-3 border border-border/10 group-hover:scale-105 transition-transform duration-300">
            <Upload size={16} />
          </div>
          <div className="text-xs font-medium text-foreground mt-1">{placeholder}</div>
          {description && (
            <div className="text-caption text-muted-foreground-lighter px-4 leading-normal">
              {description}
            </div>
          )}
        </div>
      )}

      {/* Images Grid Previews */}
      {value.length > 0 && (
        <div
          className={cn(
            maxFiles === 1 ? "block mt-2" : "grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2",
          )}
        >
          {value.map((img, idx) => {
            const isPrimary = showPrimary && idx === 0;
            return (
              <div
                key={idx}
                className={cn(
                  "relative rounded-(--radius-xl) border overflow-hidden group select-none transition-all",
                  previewClassName ||
                    (aspectRatio === "video"
                      ? "aspect-video w-full"
                      : aspectRatio === "banner"
                        ? "aspect-banner w-full"
                        : aspectRatio === "logo"
                          ? "aspect-logo w-full"
                          : "aspect-square w-full"),
                  isPrimary
                    ? "border-primary ring-1 ring-ring/30"
                    : "border-border/60 hover:border-primary/40",
                )}
              >
                <img
                  src={img}
                  alt={`Upload preview ${idx + 1}`}
                  className="object-cover h-full w-full"
                />

                {/* Top Action Indicators */}
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-between p-2">
                  <IconButton
                    type="button"
                    size="sm"
                    shape="circle"
                    variant="contained"
                    colors="surface"
                    title="Remove image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    className="h-6 w-6 text-brand-accent shadow hover:scale-105"
                  >
                    <X size={16} />
                  </IconButton>

                  {showPrimary && !isPrimary && (
                    <Button
                      type="button"
                      size="xs"
                      shape="circle"
                      variant="contained"
                      colors="surface"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(idx);
                      }}
                      className="h-auto px-2 py-1 text-caption font-medium shadow hover:scale-105 active:scale-100"
                    >
                      Make primary
                    </Button>
                  )}
                </div>

                {isPrimary && (
                  <div className="absolute bottom-2 left-2">
                    <Badge
                      variant="contained"
                      color="primary"
                      shape="circle"
                      size="md"
                      startIcon={<Check />}
                    >
                      Primary
                    </Badge>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {error && <p className="ui-form-help-text font-medium text-destructive mt-1">{error}</p>}
    </div>
  );
}
