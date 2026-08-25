"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/inputs/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/overlay/command";

/**
 * Селект категорий: вложенное дерево с поиском.
 *
 * Список — Command (cmdk): поиск отбирает узлы по имени, у найденного узла
 * видна цепочка предков — положение в дереве не теряется. Без поиска дерево
 * показано целиком с отступами по уровню.
 *
 * Режимы: `single` — один узел (плюс опция «корня», где применима),
 * `multiple` — несколько узлов с чекбоксами. Недопустимые узлы (`disabledIds`)
 * не выбираются — например, сам узел и его поддерево при выборе родителя.
 */

export interface CategoryTreeOption {
  id: string;
  name: string;
  depth: number;
  parentId?: string | null;
}

interface BaseProps {
  options: CategoryTreeOption[];
  label?: string;
  placeholder?: string;
  disabledIds?: Set<string>;
  error?: string;
  "data-testid"?: string;
}

interface SingleProps extends BaseProps {
  mode: "single";
  value: string | null;
  onChange: (value: string | null) => void;
  /** Показывать вариант «без родителя (корень)», выбирающий null. */
  allowRoot?: boolean;
  rootLabel?: string;
}

interface MultipleProps extends BaseProps {
  mode: "multiple";
  value: string[];
  onChange: (value: string[]) => void;
}

export type CategoryTreeSelectProps = SingleProps | MultipleProps;

const ROOT_VALUE = "__root__";

export function CategoryTreeSelect(props: CategoryTreeSelectProps) {
  const { options, label, placeholder, disabledIds, error } = props;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const byId = React.useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );

  /** Цепочка предков для подписи найденного узла: «Аналитика / Рынок». */
  const ancestorPath = React.useCallback(
    (option: CategoryTreeOption): string => {
      const names: string[] = [];
      let parentId = option.parentId ?? null;
      while (parentId != null) {
        const parent = byId.get(parentId);
        if (!parent) break;
        names.unshift(parent.name);
        parentId = parent.parentId ?? null;
      }
      return names.join(" / ");
    },
    [byId],
  );

  const searching = query.trim() !== "";

  const triggerText = React.useMemo(() => {
    if (props.mode === "single") {
      if (props.value === null) {
        return props.allowRoot
          ? (props.rootLabel ?? "No parent (root)")
          : (placeholder ?? "Select…");
      }
      return byId.get(props.value)?.name ?? placeholder ?? "Select…";
    }
    if (props.value.length === 0) return placeholder ?? "Select categories…";
    const names = props.value.map((id) => byId.get(id)?.name).filter(Boolean);
    return names.length <= 2
      ? names.join(", ")
      : `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
  }, [props, byId, placeholder]);

  const isSelected = (id: string) =>
    props.mode === "single" ? props.value === id : props.value.includes(id);

  const pick = (id: string) => {
    if (disabledIds?.has(id)) return;
    if (props.mode === "single") {
      props.onChange(id);
      setOpen(false);
      return;
    }
    props.onChange(
      props.value.includes(id) ? props.value.filter((v) => v !== id) : [...props.value, id],
    );
  };

  const control = (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          colors="surface"
          size="auto"
          shape="rounded"
          className="h-10 w-full justify-between border border-border bg-background px-3 text-body font-normal"
          endIcon={<ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground-lighter" />}
          data-testid={props["data-testid"]}
        >
          <span className="truncate text-left">{triggerText}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
        {/* Поиск и фильтрация — свои: cmdk сортирует по релевантности, а дереву нужен свой порядок. */}
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search categories…" value={query} onValueChange={setQuery} />
          <CommandList className="max-h-64">
            <CommandEmpty>No categories found.</CommandEmpty>
            {props.mode === "single" && props.allowRoot && !searching && (
              <CommandItem
                value={ROOT_VALUE}
                onSelect={() => {
                  props.onChange(null);
                  setOpen(false);
                }}
                className="gap-2"
                data-category-option="__root__"
              >
                <Check
                  className={cn("size-4", props.value === null ? "opacity-100" : "opacity-0")}
                />
                {props.rootLabel ?? "No parent (root)"}
              </CommandItem>
            )}
            {options
              .filter(
                (option) =>
                  !searching || option.name.toLowerCase().includes(query.trim().toLowerCase()),
              )
              .map((option) => {
                const disabled = disabledIds?.has(option.id) ?? false;
                const path = searching ? ancestorPath(option) : "";

                return (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    disabled={disabled}
                    onSelect={() => pick(option.id)}
                    className="gap-2"
                    data-category-option={option.id}
                    style={
                      !searching && option.depth > 0
                        ? { paddingInlineStart: `${8 + option.depth * 16}px` }
                        : undefined
                    }
                  >
                    {props.mode === "multiple" ? (
                      <Checkbox
                        checked={isSelected(option.id)}
                        tabIndex={-1}
                        className="pointer-events-none"
                        aria-hidden
                      />
                    ) : (
                      <Check
                        className={cn(
                          "size-4",
                          isSelected(option.id) ? "opacity-100" : "opacity-0",
                        )}
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {option.name}
                      {path && (
                        <span className="ms-2 text-caption text-muted-foreground-lighter">
                          {path}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                );
              })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (!label && !error) return control;

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-muted-foreground block">{label}</span>}
      {control}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
