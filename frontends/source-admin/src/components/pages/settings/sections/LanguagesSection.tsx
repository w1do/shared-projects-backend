"use client";

import * as React from "react";
import { Languages, Plus, Sparkles, Trash2, X } from "lucide-react";
import { toast } from "sonner";
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
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Input } from "@/components/ui/inputs/input";
import {
  useDeleteTranslationMutation,
  useProjectLocalesQuery,
  useSaveProjectLocalesMutation,
  useTranslateMissingMutation,
  useTranslationsQuery,
  useUpsertTranslationMutation,
} from "@/hooks/admin/localization";
import type { PlatformTranslation } from "@/lib/admin/data-source/platform/localization";
import { SettingsSection } from "./shared/SettingsSection";

/** Управление языками проекта: локали, словарь переводов, автоперевод. */
export function LanguagesSection() {
  const { data: locales = [], isPending: localesPending } = useProjectLocalesQuery();
  const saveLocales = useSaveProjectLocalesMutation();
  const { data: translations = [] } = useTranslationsQuery();
  const upsert = useUpsertTranslationMutation();
  const remove = useDeleteTranslationMutation();
  const translateMissing = useTranslateMissingMutation();

  const [newLocale, setNewLocale] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [newKey, setNewKey] = React.useState("");

  const filtered = React.useMemo(
    () =>
      search.trim() === ""
        ? translations
        : translations.filter((row) => row.key.toLowerCase().includes(search.trim().toLowerCase())),
    [translations, search],
  );

  const addLocale = () => {
    const locale = newLocale.trim().toLowerCase();
    if (locale === "" || locales.includes(locale)) return;
    saveLocales.mutate([...locales, locale], {
      onSuccess: () => {
        toast.success(`Locale "${locale}" added.`);
        setNewLocale("");
      },
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const removeLocale = (locale: string) => {
    saveLocales.mutate(
      locales.filter((item) => item !== locale),
      {
        onSuccess: () =>
          toast.success(
            `Locale "${locale}" removed. Saved translations for it are kept and will return if the locale is re-added.`,
          ),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return (
    <div className="flex flex-col gap-8" data-testid="languages-section">
      <SettingsSection
        icon={Languages}
        title="Project locales"
        description="Languages available for translations. The first locale is the default one."
      >
        <div className="flex flex-wrap items-center gap-2" data-testid="locale-list">
          {locales.map((locale, index) => (
            <Badge key={locale} color={index === 0 ? "primary" : "neutral"} variant="soft" shape="circle">
              <span className="uppercase">{locale}</span>
              {index === 0 && <span className="ms-1 text-caption">· default</span>}
              {index > 0 && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  shape="circle"
                  aria-label={`Remove locale ${locale}`}
                  disabled={saveLocales.isPending}
                  onClick={() => removeLocale(locale)}
                >
                  <X className="size-3" />
                </IconButton>
              )}
            </Badge>
          ))}
          {!localesPending && locales.length === 0 && (
            <span className="text-caption text-muted-foreground-lighter">No locales configured.</span>
          )}
        </div>
        <div className="flex max-w-xs items-center gap-2">
          <Input
            placeholder="e.g. en"
            value={newLocale}
            onChange={(event) => setNewLocale(event.target.value)}
            data-testid="locale-input"
          />
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            startIcon={<Plus />}
            disabled={saveLocales.isPending}
            onClick={addLocale}
          >
            Add
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        icon={Sparkles}
        title="Translation dictionary"
        description="Interface strings per locale. Machine-translated values are marked until reviewed."
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xs w-full">
            <Input
              placeholder="Search keys…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              data-testid="dictionary-search"
            />
          </div>
          <Button
            type="button"
            variant="contained"
            shape="circle"
            size="sm"
            startIcon={<Sparkles />}
            disabled={translateMissing.isPending}
            onClick={() =>
              translateMissing.mutate(undefined, {
                onSuccess: () => toast.success("Auto-translation queued. Missing locales will be filled in the background."),
                onError: (error: Error) => toast.error(error.message),
              })
            }
            data-testid="translate-missing"
          >
            Translate missing
          </Button>
        </div>

        <div className="flex max-w-md items-center gap-2">
          <Input
            placeholder="New key, e.g. nav.dashboard"
            value={newKey}
            onChange={(event) => setNewKey(event.target.value)}
            data-testid="dictionary-new-key"
          />
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            startIcon={<Plus />}
            disabled={upsert.isPending || newKey.trim() === "" || locales.length === 0}
            onClick={() =>
              upsert.mutate(
                { id: null, key: newKey.trim(), values: { [locales[0]]: newKey.trim() } },
                {
                  onSuccess: () => {
                    toast.success("Key added.");
                    setNewKey("");
                  },
                  onError: (error: Error) => toast.error(error.message),
                },
              )
            }
          >
            Add key
          </Button>
        </div>

        <Table data-testid="dictionary-table">
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              {locales.map((locale) => (
                <TableHead key={locale} className="uppercase">
                  {locale}
                </TableHead>
              ))}
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={locales.length + 2} className="py-8 text-center text-caption text-muted-foreground-lighter">
                  No dictionary keys yet.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((row) => (
              <DictionaryRow key={row.id} row={row} locales={locales} />
            ))}
          </TableBody>
        </Table>
      </SettingsSection>
    </div>
  );
}

function DictionaryRow({ row, locales }: { row: PlatformTranslation; locales: string[] }) {
  const upsert = useUpsertTranslationMutation();
  const remove = useDeleteTranslationMutation();
  const [values, setValues] = React.useState<Record<string, string>>(row.values);

  React.useEffect(() => setValues(row.values), [row.values]);

  const dirty = React.useMemo(
    () => locales.some((locale) => (values[locale] ?? "") !== (row.values[locale] ?? "")),
    [values, row.values, locales],
  );

  const save = () => {
    const next = Object.fromEntries(
      Object.entries(values).filter(([, value]) => value.trim() !== ""),
    );
    upsert.mutate(
      { id: row.id, key: row.key, values: next },
      {
        onSuccess: () => toast.success(`"${row.key}" saved.`),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return (
    <TableRow data-translation-key={row.key}>
      <TableCell className="font-medium">{row.key}</TableCell>
      {locales.map((locale) => (
        <TableCell key={locale}>
          <div className="flex items-center gap-2">
            <Input
              value={values[locale] ?? ""}
              onChange={(event) => setValues((current) => ({ ...current, [locale]: event.target.value }))}
              aria-label={`${row.key} ${locale}`}
            />
            {row.machine?.[locale] && (
              <Badge color="warning" variant="soft" shape="circle" data-testid="machine-badge">
                machine
              </Badge>
            )}
          </div>
        </TableCell>
      ))}
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!dirty || upsert.isPending}
            onClick={save}
          >
            Save
          </Button>
          <IconButton
            variant="ghost"
            size="sm"
            shape="circle"
            color="error"
            aria-label={`Delete ${row.key}`}
            disabled={remove.isPending}
            onClick={() =>
              remove.mutate(row.id, {
                onSuccess: () => toast.success(`"${row.key}" deleted.`),
                onError: (error: Error) => toast.error(error.message),
              })
            }
          >
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </TableCell>
    </TableRow>
  );
}
