import * as React from "react";
import { Button } from "@/components/ui/inputs/button";

type StatusFiltersProps<T extends string = string> = {
  options: readonly T[] | T[];
  value: T;
  onChange: (value: T) => void;
  counts?: Record<T, number> | ((val: T) => number);
};

export function StatusFilters<T extends string = string>({
  options,
  value,
  onChange,
  counts,
}: StatusFiltersProps<T>) {
  const getCount = (item: T) => {
    if (!counts) return undefined;
    if (typeof counts === "function") return counts(item);
    return counts[item];
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((item) => {
        const active = item === value;
        const count = getCount(item);

        return (
          <Button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            variant="contained"
            color={active ? "primary" : "surface"}
            size="sm"
            shape="circle"
          >
            {item}
            {count !== undefined && <span className="font-mono text-xs opacity-70">{count}</span>}
          </Button>
        );
      })}
    </div>
  );
}
