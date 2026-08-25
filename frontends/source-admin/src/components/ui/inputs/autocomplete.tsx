"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/overlay/popover";
import { Badge } from "@/components/ui/data-display/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/overlay/command";

const autocompleteTriggerVariants = cva(
  "flex w-full items-center justify-between transition-all duration-300 ease-out focus:outline-none disabled:cursor-not-allowed disabled:border-input/20 disabled:bg-input-disabled disabled:text-muted-foreground-lighter/60 text-left text-caption text-foreground cursor-pointer gap-2",
  {
    variants: {
      variant: {
        contained: "shadow-inner border border-transparent bg-card hover:bg-card focus:bg-card",
        outlined:
          "border-2 border-input/70 bg-card/80 hover:border-border-hover hover:bg-card hover:shadow-inner focus:border-foreground focus:bg-card focus:ring-4 focus:ring-ring/5",
        soft: "border-transparent bg-muted/40 text-foreground focus:bg-card focus:border-input",
        ghost: "bg-transparent border-transparent focus:bg-card/50",
      },
      color: {
        primary: "focus:border-primary focus:ring-primary/5",
        secondary: "focus:border-brand-accent focus:ring-brand-accent/5",
        surface: "focus:border-foreground focus:ring-ring/5",
        warning: "focus:border-warning focus:ring-warning/5 text-warning-dark",
        info: "focus:border-info focus:ring-info/5 text-info",
        error: "focus:border-destructive focus:ring-destructive/5 text-destructive",
        success: "focus:border-success focus:ring-success/5 text-success",
      },
      size: {
        xs: "min-h-6 text-xs py-1 px-2",
        sm: "min-h-8 text-xs py-1 px-3",
        md: "min-h-10 text-sm py-2 px-4",
        lg: "min-h-12 text-sm py-3 px-4",
      },
      shape: {
        rounded: "rounded-lg",
        rectangle: "rounded-none",
        circle: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "outlined",
      color: "surface",
      size: "md",
      shape: "rounded",
    },
  },
);

export interface AutocompleteOption {
  label: string;
  value: string;
}

export interface AutocompleteProps
  extends
    Omit<React.ComponentPropsWithoutRef<"div">, "value" | "onChange" | "color" | "size">,
    VariantProps<typeof autocompleteTriggerVariants> {
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  options: AutocompleteOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  error?: string;
  allowCustomValue?: boolean;
  customValueLabel?: (value: string) => string;
  renderOption?: (option: AutocompleteOption) => React.ReactNode;
  renderValue?: (option: AutocompleteOption) => React.ReactNode;
  multiple?: boolean;
  disabled?: boolean;
}

export const Autocomplete = React.forwardRef<HTMLDivElement, AutocompleteProps>(
  (
    {
      value,
      onChange,
      options,
      placeholder = "Select or type...",
      searchPlaceholder = "Search options...",
      label,
      error,
      allowCustomValue = false,
      customValueLabel = (customValue) => `Use "${customValue}"`,
      renderOption,
      renderValue,
      variant = "outlined",
      color = "surface",
      size = "md",
      shape = "rounded",
      multiple = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Safe handling of single vs multiple values
    const selectedValues = React.useMemo(() => {
      if (multiple) {
        return Array.isArray(value) ? value : value ? [value] : [];
      }
      return typeof value === "string" ? [value] : [];
    }, [value, multiple]);

    const trimmedSearchQuery = searchQuery.trim();
    const canCreateCustomValue =
      allowCustomValue &&
      trimmedSearchQuery.length > 0 &&
      !options.some((option) => option.value.toLowerCase() === trimmedSearchQuery.toLowerCase());

    const handleSelect = (selectedValue: string) => {
      if (multiple) {
        const nextValues = selectedValues.includes(selectedValue)
          ? selectedValues.filter((v) => v !== selectedValue)
          : [...selectedValues, selectedValue];
        onChange?.(nextValues);
      } else {
        onChange?.(selectedValue);
        setOpen(false);
      }
      setSearchQuery("");
    };

    const handleRemoveValue = React.useCallback(
      (valToRemove: string, e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const nextValues = selectedValues.filter((v) => v !== valToRemove);
        onChange?.(multiple ? nextValues : "");
      },
      [selectedValues, onChange, multiple],
    );

    const renderOptionContent = React.useCallback(
      (option: AutocompleteOption) => (renderOption ? renderOption(option) : option.label),
      [renderOption],
    );

    const triggerLabel = React.useMemo(() => {
      if (selectedValues.length === 0) {
        return <span className="text-muted-foreground-lighter">{placeholder}</span>;
      }

      if (multiple) {
        return (
          <div className="flex flex-wrap gap-1.5 py-0.5 max-w-full">
            {selectedValues.map((val) => {
              const opt = options.find((o) => o.value.toLowerCase() === val.toLowerCase());
              const displayLabel = opt ? opt.label : val;
              return (
                <Badge
                  key={val}
                  variant="soft"
                  colors="neutral"
                  shape="circle"
                  size="sm"
                  data-prevent-trigger-open
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                  endIcon={
                    <span
                      data-prevent-trigger-open
                      className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors ml-0.5 inline-flex items-center justify-center p-0.5"
                      onClick={(e) => {
                        handleRemoveValue(val, e);
                      }}
                      onPointerDown={(e) => {
                        handleRemoveValue(val, e);
                      }}
                      onMouseDown={(e) => {
                        handleRemoveValue(val, e);
                      }}
                    >
                      <X size={10} className="pointer-events-none" />
                    </span>
                  }
                >
                  {displayLabel}
                </Badge>
              );
            })}
          </div>
        );
      }

      const opt = options.find((o) => o.value.toLowerCase() === selectedValues[0].toLowerCase());
      return opt ? renderValue?.(opt) || renderOptionContent(opt) : selectedValues[0];
    }, [
      selectedValues,
      options,
      placeholder,
      multiple,
      renderValue,
      renderOptionContent,
      handleRemoveValue,
    ]);

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block text-xs font-medium text-muted-foreground">{label}</label>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <div
              ref={ref}
              role="combobox"
              aria-expanded={open}
              tabIndex={disabled ? -1 : 0}
              className={cn(
                autocompleteTriggerVariants({
                  variant,
                  color,
                  size,
                  shape,
                }),
                disabled && "pointer-events-none opacity-50",
                error && "border-destructive focus:ring-destructive/5",
                className,
              )}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
              onClick={(e) => {
                if (disabled) return;
                // Only open if the click didn't originate from a badge or close button
                const target = e.target as HTMLElement;
                if (!target.closest("[data-prevent-trigger-open]")) {
                  setOpen((prev) => !prev);
                }
              }}
              {...props}
            >
              <div className="flex-1 min-w-0 flex items-center">{triggerLabel}</div>
              <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground-lighter opacity-60" />
            </div>
          </PopoverAnchor>

          <PopoverContent className="w-(--radix-popover-trigger-width) z-50 overflow-hidden rounded-(--radius-2xl) border border-border/40 bg-background p-0 shadow-subtle">
            <Command className="border-0">
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandList className="max-h-60 overflow-y-auto">
                <CommandEmpty className="p-4 text-center text-xs text-muted-foreground-lighter">
                  No matching option found.
                </CommandEmpty>

                {canCreateCustomValue && (
                  <CommandGroup heading="Custom Option">
                    <CommandItem
                      value={trimmedSearchQuery}
                      onSelect={() => handleSelect(trimmedSearchQuery)}
                      className="font-medium text-primary data-[selected=true]:bg-accent data-[selected=true]:text-foreground"
                    >
                      <Check className="mr-2 size-4 opacity-0" />
                      {customValueLabel(trimmedSearchQuery)}
                    </CommandItem>
                  </CommandGroup>
                )}

                <CommandGroup heading="Suggestions">
                  {options.map((option) => {
                    const isSelected = selectedValues.some(
                      (v) => v.toLowerCase() === option.value.toLowerCase(),
                    );

                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className={cn(
                          "data-[selected=true]:bg-accent data-[selected=true]:text-foreground",
                          isSelected && "bg-primary/10 text-foreground font-semibold",
                        )}
                      >
                        <Check
                          className={cn("mr-2 size-4", isSelected ? "opacity-100" : "opacity-0")}
                        />
                        <span className="flex min-w-0 items-center gap-2 truncate">
                          {renderOptionContent(option)}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {error && <p className="ui-form-help-text font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);

Autocomplete.displayName = "Autocomplete";
