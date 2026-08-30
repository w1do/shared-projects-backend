"use client";

import * as React from "react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useCitySeoQuery, useSaveCitySeoMutation } from "@/hooks/admin/cities";
import type { ConsoleTextKey } from "@/lib/admin/console-texts";
import { formatJsonObject, parseJsonObject } from "@/lib/admin/key-value-json";
import type { PlatformCity } from "@/lib/admin/services";
import { useConsoleText } from "@/lib/admin/use-console-text";

type TextField =
  | "title"
  | "description"
  | "keywords"
  | "canonical"
  | "robots"
  | "og_title"
  | "og_description"
  | "og_image"
  | "twitter_card";

const TEXT_FIELDS: TextField[] = [
  "title",
  "description",
  "keywords",
  "canonical",
  "robots",
  "og_title",
  "og_description",
  "og_image",
  "twitter_card",
];

const LABELS: Record<TextField, ConsoleTextKey> = {
  title: "console.seo.table.title",
  description: "console.seo.table.description",
  keywords: "console.seo.table.keywords",
  canonical: "console.seo.table.canonical",
  robots: "console.seo.table.robots",
  og_title: "console.seo.table.og-title",
  og_description: "console.seo.table.og-description",
  og_image: "console.seo.table.og-image",
  twitter_card: "console.seo.table.twitter-card",
};

/** SEO города: те же поля, что у прочих сущностей; без права — только просмотр. */
export function CitySeoDialog({
  city,
  canManage,
  onClose,
}: {
  city: PlatformCity | null;
  canManage: boolean;
  onClose: () => void;
}) {
  const t = useConsoleText();
  const seo = useCitySeoQuery(city?.id ?? null);
  const save = useSaveCitySeoMutation();

  const [fields, setFields] =
    React.useState<Record<TextField, string>>(emptyFields());
  const [jsonLd, setJsonLd] = React.useState("");
  const [jsonError, setJsonError] = React.useState(false);

  const stored = seo.data ?? null;

  React.useEffect(() => {
    if (city === null) return;

    setFields(
      Object.fromEntries(
        TEXT_FIELDS.map((field) => [field, stored?.[field] ?? ""]),
      ) as Record<TextField, string>,
    );
    setJsonLd(stored?.json_ld ? formatJsonObject(stored.json_ld) : "");
    setJsonError(false);
  }, [city, stored]);

  if (city === null) return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedJson = jsonLd.trim();
    const parsed = trimmedJson === "" ? null : parseJsonObject(trimmedJson);

    if (parsed !== null && !parsed.ok) {
      setJsonError(true);
      return;
    }

    setJsonError(false);
    save.mutate(
      {
        id: city.id,
        meta: {
          ...Object.fromEntries(
            TEXT_FIELDS.map((field) => [
              field,
              fields[field].trim() === "" ? null : fields[field],
            ]),
          ),
          json_ld: parsed === null ? null : parsed.value,
        },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent scroll className="overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{city.name}</DialogTitle>
          <DialogDescription>
            {canManage
              ? t("console.cities.seo.hint")
              : t("console.cities.seo.read-only")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="mt-2 flex flex-col gap-4">
          {TEXT_FIELDS.map((field) => (
            <Input
              key={field}
              label={t(LABELS[field])}
              value={fields[field]}
              readOnly={!canManage}
              onChange={(e) =>
                setFields({ ...fields, [field]: e.target.value })
              }
              data-testid={`cities-seo-field-${field}`}
            />
          ))}

          <Textarea
            label={t("console.seo.table.json-ld")}
            value={jsonLd}
            rows={6}
            readOnly={!canManage}
            onChange={(e) => setJsonLd(e.target.value)}
            error={jsonError ? t("console.seo.form.json-invalid") : undefined}
            data-testid="cities-seo-field-json-ld"
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outlined"
              shape="circle"
              onClick={onClose}
            >
              {t("console.common.close")}
            </Button>
            {canManage && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                shape="circle"
                disabled={save.isPending}
                data-testid="cities-seo-save"
              >
                {t("console.common.save")}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function emptyFields(): Record<TextField, string> {
  return Object.fromEntries(TEXT_FIELDS.map((field) => [field, ""])) as Record<
    TextField,
    string
  >;
}
