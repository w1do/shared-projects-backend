import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/inputs/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/overlay/dropdown-menu";

export interface SelectProps extends Omit<React.ComponentProps<"select">, "ref"> {
  label?: string;
  labelClassName?: string;
  labelRight?: React.ReactNode;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string; image?: string }[] | string[];
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      labelClassName,
      labelRight,
      error,
      options,
      placeholder,
      value,
      onChange,
      ...props
    },
    ref,
  ) => {
    const triggerStyle = cn(
      "h-10 w-full justify-between rounded-(--radius-2xl) border-2 border-border/70 bg-background/80 px-4 text-caption text-foreground shadow-inner transition-all duration-300 ease-out hover:border-muted-foreground-lighter hover:bg-background hover:shadow-inner focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-ring/5 active:scale-100",
      !value && "text-muted-foreground-lighter",
      !label && !error && className,
    );

    const selectedOption = React.useMemo<React.ReactNode>(() => {
      if (value === undefined || value === null || value === "") return null;
      const opt = options.find((o) =>
        typeof o === "string" ? o === String(value) : o.value === String(value),
      );
      if (!opt) return null;
      if (typeof opt === "string") return opt;
      if (opt.image) {
        return (
          <span className="inline-flex items-center gap-2 text-left min-w-0">
            <img
              src={opt.image}
              alt={opt.label}
              className="size-5 rounded-md object-cover shrink-0"
            />
            <span className="truncate">{opt.label}</span>
          </span>
        );
      }
      return opt.label;
    }, [value, options]);

    const handleValueChange = (newValue: string) => {
      if (onChange) {
        const event = {
          target: { value: newValue, name: props.name },
          currentTarget: { value: newValue, name: props.name },
          preventDefault: () => {},
          stopPropagation: () => {},
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(event);
      }
    };

    // Filter out props that collide with Button's semantic API or invalid HTML button attrs
    const {
      multiple: _multiple,
      size: _size,
      color: _color,
      ...buttonProps
    } = props as unknown as React.ComponentPropsWithoutRef<"button"> & {
      multiple?: boolean;
      size?: number;
    };

    const renderSelect = (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="ghost"
            colors="surface"
            size="auto"
            shape="rounded"
            className={triggerStyle}
            endIcon={
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground-lighter transition-colors duration-300" />
            }
            {...buttonProps}
          >
            <span className="truncate flex items-center min-w-0">
              {selectedOption || placeholder || "Select..."}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-(--radix-dropdown-menu-trigger-width) max-h-60 overflow-y-auto">
          <DropdownMenuRadioGroup value={String(value || "")} onValueChange={handleValueChange}>
            {options.map((opt) => {
              const val = typeof opt === "string" ? opt : opt.value;
              const lbl = typeof opt === "string" ? opt : opt.label;
              const img = typeof opt === "string" ? undefined : opt.image;
              return (
                <DropdownMenuRadioItem key={val} value={val} className="flex items-center gap-2">
                  {img && (
                    <img src={img} alt={lbl} className="size-5 rounded-md object-cover shrink-0" />
                  )}
                  <span className="truncate">{lbl}</span>
                </DropdownMenuRadioItem>
              );
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    if (!label && !error) {
      return renderSelect;
    }

    return (
      <div className={cn("space-y-2 w-full", className)}>
        <div className="flex items-center justify-between">
          {label && (
            <label
              className={cn("text-xs font-medium text-muted-foreground block", labelClassName)}
            >
              {label}
            </label>
          )}
          {labelRight && labelRight}
        </div>
        {renderSelect}
        {error && <p className="ui-form-help-text font-medium text-destructive">{error}</p>}
      </div>
    );
  },
);
Select.displayName = "Select";

export { Select };
