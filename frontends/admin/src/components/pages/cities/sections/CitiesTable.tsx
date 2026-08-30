"use client";

import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-display/table";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Switch } from "@/components/ui/inputs/switch";
import type { PlatformCity } from "@/lib/admin/services";
import { useConsoleText } from "@/lib/admin/use-console-text";

/** Города справочника с состоянием проекта: включённость и заполненность SEO. */
export function CitiesTable({
  cities,
  isPending,
  canManage,
  isToggling,
  onToggle,
  onEditSeo,
}: {
  cities: PlatformCity[];
  isPending: boolean;
  canManage: boolean;
  isToggling: boolean;
  onToggle: (city: PlatformCity, enabled: boolean) => void;
  onEditSeo: (city: PlatformCity) => void;
}) {
  const t = useConsoleText();

  return (
    <div className="overflow-x-auto">
      <Table data-testid="cities-table">
        <TableHeader>
          <TableRow>
            <TableHead>{t("console.cities.table.name")}</TableHead>
            <TableHead>{t("console.cities.table.region")}</TableHead>
            <TableHead>{t("console.cities.table.population")}</TableHead>
            <TableHead>{t("console.cities.table.enabled")}</TableHead>
            <TableHead>{t("console.cities.table.seo")}</TableHead>
            <TableHead className="w-16 text-right">
              {t("console.common.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isPending && cities.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-8 text-center text-caption text-muted-foreground-lighter"
              >
                {t("console.cities.empty")}
              </TableCell>
            </TableRow>
          )}
          {cities.map((city) => (
            <TableRow key={city.id} data-city={city.slug}>
              <TableCell className="font-medium">{city.name}</TableCell>
              <TableCell>{city.region_name}</TableCell>
              <TableCell>{city.population.toLocaleString("ru-RU")}</TableCell>
              <TableCell>
                <Switch
                  checked={city.enabled}
                  disabled={!canManage || isToggling}
                  onCheckedChange={(checked) => onToggle(city, checked)}
                  aria-label={city.name}
                  data-testid="cities-toggle"
                />
              </TableCell>
              <TableCell>
                <Badge
                  color={city.has_seo ? "success" : "secondary"}
                  variant="soft"
                  shape="circle"
                >
                  {city.has_seo
                    ? t("console.cities.seo.filled")
                    : t("console.cities.seo.empty")}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <IconButton
                  aria-label={t("console.cities.seo.title")}
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditSeo(city)}
                  data-testid="cities-seo-open"
                >
                  <Pencil />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
