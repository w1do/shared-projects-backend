"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import {
  useCitiesQuery,
  useCityBulkMutation,
  useCityRegionsQuery,
  useCitySeoAdaptation,
  useSetCityEnabledMutation,
} from "@/hooks/admin/cities";
import { useConsoleAccessQuery } from "@/hooks/admin/project";
import { taskStageLabel } from "@/lib/admin/task-labels";
import type { PlatformCity } from "@/lib/admin/services";
import { useConsoleText } from "@/lib/admin/use-console-text";

import { CityAdaptationDialog } from "./sections/CityAdaptationDialog";
import { CityBulkAction } from "./sections/CityBulkAction";
import {
  CitiesFilters,
  type CitiesFilterState,
} from "./sections/CitiesFilters";
import { CitiesTable } from "./sections/CitiesTable";
import { CitySeoDialog } from "./sections/CitySeoDialog";

const INITIAL_FILTERS: CitiesFilterState = {
  search: "",
  regionId: undefined,
  enabled: undefined,
  sort: "population",
  direction: "desc",
};

/** Раздел «Города»: состав справочника в проекте, SEO города и AI-адаптация. */
export default function CitiesPage() {
  const t = useConsoleText();
  const [filters, setFilters] = React.useState(INITIAL_FILTERS);
  const [editing, setEditing] = React.useState<PlatformCity | null>(null);
  const [adapting, setAdapting] = React.useState(false);

  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useCitiesQuery(filters);
  const regions = useCityRegionsQuery();
  const toggle = useSetCityEnabledMutation();
  const bulk = useCityBulkMutation();
  const adaptation = useCitySeoAdaptation();
  const access = useConsoleAccessQuery();

  const canManage = access.data?.canManageCities ?? false;
  const running = adaptation.runningTask !== undefined;

  return (
    <div className="flex flex-col gap-8" data-testid="cities-page">
      <PageHeader
        title={t("console.nav.cities")}
        description={t("console.cities.description")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.content"), href: "/admin/blogs" },
          { label: t("console.nav.cities") },
        ]}
        actions={
          canManage ? (
            <div className="flex flex-wrap items-center gap-2">
              <CityBulkAction
                action="enable-all"
                title={t("console.cities.bulk.enable-all-title")}
                description={t("console.cities.bulk.enable-all-description")}
                label={t("console.cities.bulk.enable-all")}
                disabled={bulk.isPending}
                onConfirm={() => bulk.mutate("enable-all")}
              />
              <CityBulkAction
                action="reset"
                title={t("console.cities.bulk.reset-title")}
                description={t("console.cities.bulk.reset-description")}
                label={t("console.cities.bulk.reset")}
                disabled={bulk.isPending}
                onConfirm={() => bulk.mutate("reset")}
              />
              <Button
                type="button"
                variant="contained"
                color="primary"
                shape="circle"
                size="sm"
                startIcon={
                  running ? <Loader2 className="animate-spin" /> : <Sparkles />
                }
                disabled={running || adaptation.isStarting}
                onClick={() => setAdapting(true)}
                data-testid="cities-adapt-open"
              >
                {t("console.cities.adapt.action")}
              </Button>
            </div>
          ) : undefined
        }
      />

      {running && (
        <p
          className="text-caption text-muted-foreground"
          data-testid="cities-adapt-running"
        >
          {t("console.cities.adapt.running")}
          {adaptation.runningTask?.stage
            ? ` · ${taskStageLabel(adaptation.runningTask.stage)}`
            : ""}
        </p>
      )}

      {adaptation.failedTask && (
        <p
          className="text-caption text-destructive"
          data-testid="cities-adapt-failed"
        >
          {t("console.cities.adapt.failed")}
          {adaptation.failedTask.failure_reason
            ? `: ${adaptation.failedTask.failure_reason}`
            : ""}
        </p>
      )}

      <CitiesFilters
        value={filters}
        regions={regions.data ?? []}
        onChange={setFilters}
      />

      <CitiesTable
        cities={items}
        isPending={isPending}
        canManage={canManage}
        isToggling={toggle.isPending}
        onToggle={(city, enabled) => toggle.mutate({ id: city.id, enabled })}
        onEditSeo={setEditing}
      />

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
            data-testid="cities-load-more"
          >
            {t("console.cities.load-more")}
          </Button>
        </div>
      )}

      <CitySeoDialog
        city={editing}
        canManage={canManage}
        onClose={() => setEditing(null)}
      />

      {adapting && (
        <CityAdaptationDialog
          affected={items.filter((city) => city.enabled).length}
          adaptation={adaptation}
          onClose={() => setAdapting(false)}
        />
      )}
    </div>
  );
}
