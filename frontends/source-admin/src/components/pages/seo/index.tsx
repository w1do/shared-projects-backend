"use client";

import * as React from "react";
import { Loader2, Pencil, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-display/table";
import { Button } from "@/components/ui/inputs/button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Select } from "@/components/ui/inputs/select";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import { useSeoCatalog, useSeoRebuild } from "@/hooks/admin/seo";
import { taskStageLabel } from "@/lib/admin/task-labels";
import type {
  PlatformSeoCatalogItem,
  SeoDirection,
  SeoSort,
} from "@/lib/admin/services/content-domain/seo-catalog";
import type { SeoSubjectType } from "@/lib/admin/services";
import { useConsoleText } from "@/lib/admin/use-console-text";

import { SeoRecordDialog } from "./sections/SeoRecordDialog";

const TYPES: SeoSubjectType[] = ["post", "page", "category"];
const SORTS: SeoSort[] = ["type", "title", "updated_at"];

/** Ключ строки: идентификаторы сущностей разных типов совпадают. */
function rowKey(item: PlatformSeoCatalogItem): string {
  return `${item.type}:${item.entity_id}`;
}

/** Раздел SEO: все поля по постам, страницам и категориям с AI-пересборкой. */
export default function SeoPage() {
  const t = useConsoleText();
  const [type, setType] = React.useState<SeoSubjectType | undefined>();
  const [sort, setSort] = React.useState<SeoSort>("updated_at");
  const [direction, setDirection] = React.useState<SeoDirection>("desc");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [editing, setEditing] = React.useState<PlatformSeoCatalogItem | null>(
    null,
  );

  const { items, isPending, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSeoCatalog({ type, sort, direction });
  const rebuild = useSeoRebuild();

  const running = rebuild.runningTask !== undefined;

  const toggle = (item: PlatformSeoCatalogItem) =>
    setSelected((current) =>
      current.includes(rowKey(item))
        ? current.filter((key) => key !== rowKey(item))
        : [...current, rowKey(item)],
    );

  const rebuildSelected = () =>
    rebuild.start(
      items
        .filter((item) => selected.includes(rowKey(item)))
        .map((item) => ({ type: item.type, id: item.entity_id })),
    );

  const typeLabel = (value: SeoSubjectType) =>
    t(`console.seo.type.${value}` as const);

  return (
    <div className="flex flex-col gap-8" data-testid="seo-page">
      <PageHeader
        title={t("console.nav.seo")}
        description={t("console.seo.description")}
        breadcrumbItems={[
          { label: t("console.common.breadcrumb-admin"), href: "/admin" },
          { label: t("console.nav.group.content"), href: "/admin/blogs" },
          { label: t("console.nav.seo") },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              size="sm"
              startIcon={running ? <Loader2 className="animate-spin" /> : <Sparkles />}
              disabled={running || rebuild.isStarting || selected.length === 0}
              onClick={rebuildSelected}
              data-testid="seo-rebuild-selected"
            >
              {t("console.seo.rebuild.selected")}
            </Button>
            <Button
              type="button"
              variant="contained"
              color="primary"
              shape="circle"
              size="sm"
              startIcon={running ? <Loader2 className="animate-spin" /> : <Sparkles />}
              disabled={running || rebuild.isStarting}
              onClick={() => rebuild.start([])}
              data-testid="seo-rebuild-all"
            >
              {t("console.seo.rebuild.all")}
            </Button>
          </div>
        }
      />

      {running && (
        <p className="text-caption text-muted-foreground" data-testid="seo-rebuild-running">
          {t("console.seo.rebuild.running")}
          {rebuild.runningTask?.stage
            ? ` · ${taskStageLabel(rebuild.runningTask.stage)}`
            : ""}
        </p>
      )}

      {rebuild.failedTask && (
        <p className="text-caption text-destructive" data-testid="seo-rebuild-failed">
          {t("console.seo.rebuild.failed")}
          {rebuild.failedTask.failure_reason
            ? `: ${rebuild.failedTask.failure_reason}`
            : ""}
        </p>
      )}

      <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
        <Select
          label={t("console.seo.filter.type")}
          value={type ?? ""}
          onChange={(e) =>
            setType(
              e.target.value === ""
                ? undefined
                : (e.target.value as SeoSubjectType),
            )
          }
          options={[
            { value: "", label: t("console.seo.filter.all") },
            ...TYPES.map((value) => ({ value, label: typeLabel(value) })),
          ]}
          data-testid="seo-filter-type"
        />
        <Select
          label={t("console.seo.filter.sort")}
          value={sort}
          onChange={(e) => setSort(e.target.value as SeoSort)}
          options={SORTS.map((value) => ({
            value,
            label: t(`console.seo.sort.${value}` as const),
          }))}
          data-testid="seo-filter-sort"
        />
        <Select
          label={t("console.seo.filter.direction")}
          value={direction}
          onChange={(e) => setDirection(e.target.value as SeoDirection)}
          options={[
            { value: "asc", label: t("console.seo.direction.asc") },
            { value: "desc", label: t("console.seo.direction.desc") },
          ]}
          data-testid="seo-filter-direction"
        />
      </div>

      <div className="overflow-x-auto">
        <Table data-testid="seo-table">
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>{t("console.seo.table.entity")}</TableHead>
              <TableHead>{t("console.seo.table.type")}</TableHead>
              <TableHead>{t("console.seo.table.title")}</TableHead>
              <TableHead>{t("console.seo.table.description")}</TableHead>
              <TableHead>{t("console.seo.table.keywords")}</TableHead>
              <TableHead>{t("console.seo.table.canonical")}</TableHead>
              <TableHead>{t("console.seo.table.robots")}</TableHead>
              <TableHead>{t("console.seo.table.og-title")}</TableHead>
              <TableHead>{t("console.seo.table.og-description")}</TableHead>
              <TableHead>{t("console.seo.table.og-image")}</TableHead>
              <TableHead>{t("console.seo.table.twitter-card")}</TableHead>
              <TableHead>{t("console.seo.table.json-ld")}</TableHead>
              <TableHead>{t("console.seo.table.state")}</TableHead>
              <TableHead className="w-16 text-right">
                {t("console.common.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isPending && items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={15}
                  className="py-8 text-center text-caption text-muted-foreground-lighter"
                >
                  {t("console.seo.empty")}
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={rowKey(item)} data-seo={rowKey(item)}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(rowKey(item))}
                    onCheckedChange={() => toggle(item)}
                    aria-label={item.entity_title}
                  />
                </TableCell>
                <TableCell className="font-medium">{item.entity_title}</TableCell>
                <TableCell>{typeLabel(item.type)}</TableCell>
                <TableCell>{item.seo.title ?? "—"}</TableCell>
                <TableCell>{item.seo.description ?? "—"}</TableCell>
                <TableCell>{item.seo.keywords ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {item.seo.canonical ?? "—"}
                </TableCell>
                <TableCell>{item.seo.robots ?? "—"}</TableCell>
                <TableCell>{item.seo.og_title ?? "—"}</TableCell>
                <TableCell>{item.seo.og_description ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">
                  {item.seo.og_image ?? "—"}
                </TableCell>
                <TableCell>{item.seo.twitter_card ?? "—"}</TableCell>
                <TableCell>
                  {item.seo.json_ld
                    ? t("console.seo.json-ld.present")
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    color={item.filled ? "success" : "secondary"}
                    variant="soft"
                    shape="circle"
                  >
                    {item.filled
                      ? t("console.seo.state.filled")
                      : t("console.seo.state.empty")}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <IconButton
                    aria-label={t("console.common.edit")}
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditing(item)}
                    data-testid="seo-edit"
                  >
                    <Pencil />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            {t("console.seo.load-more")}
          </Button>
        </div>
      )}

      <SeoRecordDialog target={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
