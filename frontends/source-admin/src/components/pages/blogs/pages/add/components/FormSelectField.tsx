"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Select } from "@/components/ui/inputs/select";

interface FilterOption {
  value: string;
  label: string;
}

interface FormSelectFieldProps {
  name: string;
  label: string;
  options: FilterOption[];
  ariaLabel: string;
  error?: string;
}

export function FormSelectField({ name, label, options, error, ariaLabel }: FormSelectFieldProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          label={label}
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          options={options}
          error={error}
          aria-label={ariaLabel}
          className="w-full"
        />
      )}
    />
  );
}
