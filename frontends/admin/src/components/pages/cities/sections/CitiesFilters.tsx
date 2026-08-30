"use client";

import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import type {
  CityDirection,
  CitySort,
  PlatformRegion,
} from "@/lib/admin/services";
import { useConsoleText } from "@/lib/admin/use-console-text";

const SORTS: CitySort[] = ["population", "name"];

export type CitiesFilterState = {
  search: string;
  regionId: number | undefined;
  enabled: boolean | undefined;
  sort: CitySort;
  direction: CityDirection;
};

/** Отбор городов: поиск, регион, включённость и сортировка. */
export function CitiesFilters({
  value,
  regions,
  onChange,
}: {
  value: CitiesFilterState;
  regions: PlatformRegion[];
  onChange: (next: CitiesFilterState) => void;
}) {
  const t = useConsoleText();

  return (
    <div className="grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Input
        label={t("console.cities.filter.search")}
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        data-testid="cities-filter-search"
      />
      <Select
        label={t("console.cities.filter.region")}
        value={value.regionId === undefined ? "" : String(value.regionId)}
        onChange={(e) =>
          onChange({
            ...value,
            regionId:
              e.target.value === "" ? undefined : Number(e.target.value),
          })
        }
        options={[
          { value: "", label: t("console.cities.filter.all") },
          ...regions.map((region) => ({
            value: String(region.id),
            label: region.name,
          })),
        ]}
        data-testid="cities-filter-region"
      />
      <Select
        label={t("console.cities.filter.state")}
        value={
          value.enabled === undefined
            ? ""
            : value.enabled
              ? "enabled"
              : "disabled"
        }
        onChange={(e) =>
          onChange({
            ...value,
            enabled:
              e.target.value === "" ? undefined : e.target.value === "enabled",
          })
        }
        options={[
          { value: "", label: t("console.cities.filter.all") },
          { value: "enabled", label: t("console.cities.filter.enabled") },
          { value: "disabled", label: t("console.cities.filter.disabled") },
        ]}
        data-testid="cities-filter-state"
      />
      <Select
        label={t("console.cities.filter.sort")}
        value={value.sort}
        onChange={(e) =>
          onChange({ ...value, sort: e.target.value as CitySort })
        }
        options={SORTS.map((sort) => ({
          value: sort,
          label: t(`console.cities.sort.${sort}` as const),
        }))}
        data-testid="cities-filter-sort"
      />
      <Select
        label={t("console.cities.filter.direction")}
        value={value.direction}
        onChange={(e) =>
          onChange({ ...value, direction: e.target.value as CityDirection })
        }
        options={[
          { value: "asc", label: t("console.cities.direction.asc") },
          { value: "desc", label: t("console.cities.direction.desc") },
        ]}
        data-testid="cities-filter-direction"
      />
    </div>
  );
}
