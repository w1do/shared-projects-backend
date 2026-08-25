"use client";

import * as React from "react";
import { CalendarDays } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay/popover";
import { Calendar } from "@/components/ui/inputs/calendar";
import { Button } from "@/components/ui/inputs/button";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  /** ISO date string in `yyyy-mm-dd` form. */
  value?: string;
  /** Returns the selected date as a `yyyy-mm-dd` string. */
  onChange: (value: string) => void;
  label?: string;
  labelClassName?: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  ariaLabel?: string;
}

/** Parse `yyyy-mm-dd` as a local date to avoid timezone drift. */
function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const displayDate = (date: Date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function DatePicker({
  value,
  onChange,
  label,
  labelClassName,
  error,
  placeholder = "Select date",
  disabled,
  ariaLabel,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDate(value);

  const triggerStyle = cn(
    "h-10 w-full justify-between rounded-(--radius-2xl) border-2 border-input/70 bg-card/80 px-4 text-xs text-foreground shadow-inner transition-all duration-300 ease-out hover:border-border-hover hover:bg-card focus-visible:border-foreground focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-ring/5 active:scale-100",
    !selected && "text-muted-foreground-lighter",
    error && "border-destructive",
  );

  const field = (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          colors="surface"
          size="auto"
          shape="rounded"
          className={triggerStyle}
          disabled={disabled}
          aria-label={ariaLabel ?? label}
          endIcon={<CalendarDays className="size-4 shrink-0 text-muted-foreground-lighter" />}
        >
          <span className="truncate">{selected ? displayDate(selected) : placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            if (!date) return;
            onChange(formatValue(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );

  if (!label && !error) return field;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className={cn("block text-xs font-medium text-muted-foreground", labelClassName)}>
          {label}
        </label>
      )}
      {field}
      {error && <p className="ui-form-help-text font-medium text-destructive">{error}</p>}
    </div>
  );
}
